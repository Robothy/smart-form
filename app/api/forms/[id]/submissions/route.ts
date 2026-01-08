import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { forms, formFields, formSubmissions } from '@/lib/db/schema'
import { successResponse, errorResponse } from '@/lib/utils/api-response'
import { SubmissionDataSchema, type SubmissionData } from '@/lib/validation/schemas'

/**
 * GET /api/forms/:id/submissions - Get all submissions for a form
 * Returns paginated list of submissions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const db = await getDb()

    // Verify form exists
    const formResult = await db.select().from(forms).where(eq(forms.id, id)).limit(1)
    if (formResult.length === 0) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Form not found'), { status: 404 })
    }

    // Get total count
    const countResult = await db
      .select({ count: formSubmissions.id })
      .from(formSubmissions)
      .where(eq(formSubmissions.formId, id))
    const total = countResult.length

    // Get paginated submissions
    const offset = (page - 1) * limit
    const submissionsResult = await db
      .select({
        id: formSubmissions.id,
        data: formSubmissions.data,
        submittedAt: formSubmissions.submittedAt,
      })
      .from(formSubmissions)
      .where(eq(formSubmissions.formId, id))
      .orderBy(formSubmissions.submittedAt)
      .limit(limit)
      .offset(offset)

    // Parse data from JSON strings
    const submissions = submissionsResult.map((sub) => ({
      id: sub.id,
      data: sub.data ? JSON.parse(sub.data) : {},
      submittedAt: sub.submittedAt,
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      successResponse({
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    )
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch submissions'),
      { status: 500 }
    )
  }
}

/**
 * POST /api/forms/:id/submissions - Submit a form
 * Validates submission data and stores it
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = await getDb()

    // Verify form exists and is published
    const formResult = await db.select().from(forms).where(eq(forms.id, id)).limit(1)
    if (formResult.length === 0) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Form not found'), { status: 404 })
    }

    const form = formResult[0]

    if (form.status !== 'published') {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'Cannot submit to unpublished form'),
        { status: 403 }
      )
    }

    // Get form fields for validation
    const fieldsResult = await db
      .select({
        id: formFields.id,
        type: formFields.type,
        label: formFields.label,
        required: formFields.required,
        options: formFields.options,
      })
      .from(formFields)
      .where(eq(formFields.formId, id))
      .orderBy(formFields.order)

    // Parse options from JSON
    const fields = fieldsResult.map((field) => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : undefined,
    }))

    // Parse and validate request body
    const body = await request.json()

    // Create validation schema with dynamic field definitions
    const fieldValidators: Record<string, any> = {}

    for (const field of fields) {
      let validator: any

      switch (field.type) {
        case 'text':
          validator = typeof body[field.id] === 'string'
            ? body[field.id].length <= 1000
            : false
          break
        case 'textarea':
          validator = typeof body[field.id] === 'string'
            ? body[field.id].length <= 10000
            : false
          break
        case 'date':
          validator = typeof body[field.id] === 'string'
          break
        case 'radio':
          validator = typeof body[field.id] === 'string' &&
            field.options?.some((opt: any) => opt.value === body[field.id])
          break
        case 'checkbox':
          validator = Array.isArray(body[field.id]) &&
            body[field.id].every((val: string) =>
              field.options?.some((opt: any) => opt.value === val)
            )
          break
        default:
          validator = false
      }

      // Check required fields
      if (field.required && (body[field.id] === undefined || body[field.id] === null || body[field.id] === '')) {
        return NextResponse.json(
          errorResponse(
            'VALIDATION_ERROR',
            `Field "${field.label}" is required`,
            { fieldId: field.id, fieldLabel: field.label }
          ),
          { status: 400 }
        )
      }

      // Check field type validation (only if value is provided)
      if (body[field.id] !== undefined && body[field.id] !== null && body[field.id] !== '' && !validator) {
        let errorMessage = `Invalid value for field "${field.label}"`

        if (field.type === 'text') {
          errorMessage = `Field "${field.label}" must be 1000 characters or less`
        } else if (field.type === 'textarea') {
          errorMessage = `Field "${field.label}" must be 10000 characters or less`
        } else if (field.type === 'radio' || field.type === 'checkbox') {
          errorMessage = `Field "${field.label}" must match one of the provided options`
        }

        return NextResponse.json(
          errorResponse('VALIDATION_ERROR', errorMessage, {
            fieldId: field.id,
            fieldLabel: field.label,
            fieldType: field.type,
          }),
          { status: 400 }
        )
      }

      fieldValidators[field.id] = body[field.id] || null
    }

    // Store submission
    const submissionId = crypto.randomUUID()
    await db.insert(formSubmissions).values({
      id: submissionId,
      formId: id,
      data: JSON.stringify(fieldValidators),
    })

    return NextResponse.json(
      successResponse({
        id: submissionId,
        message: 'Form submitted successfully',
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating submission:', error)

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid JSON in request body'),
        { status: 400 }
      )
    }

    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to submit form'),
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getDb, schema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { CreateFormFieldSchema, UpdateFormFieldSchema, successResponse, errorResponse, ErrorCode } from '@/lib/utils/api-response'
import type { NewFormField } from '@/lib/db/schema'

/**
 * GET /api/forms/:id/fields - Get all fields for a form (for grid view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params

    const db = await getDb()

    // Check if form exists
    const [existingForm] = await db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.id, formId))
      .limit(1)

    if (!existingForm) {
      return NextResponse.json(
        errorResponse(ErrorCode.NOT_FOUND, 'Form not found'),
        { status: 404 }
      )
    }

    // Get fields ordered by order
    const fields = await db
      .select({
        id: schema.formFields.id,
        label: schema.formFields.label,
        type: schema.formFields.type,
        required: schema.formFields.required,
        order: schema.formFields.order,
      })
      .from(schema.formFields)
      .where(eq(schema.formFields.formId, formId))
      .orderBy(schema.formFields.order)

    return NextResponse.json(successResponse({ fields }))
  } catch (error) {
    console.error('Error getting fields:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to get fields'),
      { status: 500 }
    )
  }
}

/**
 * POST /api/forms/:id/fields - Add a field to a form
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params
    const body = await request.json()

    const db = await getDb()

    // Check if form exists
    const [existingForm] = await db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.id, formId))
      .limit(1)

    if (!existingForm) {
      return NextResponse.json(
        errorResponse(ErrorCode.NOT_FOUND, 'Form not found'),
        { status: 404 }
      )
    }

    // Prevent adding fields to published forms
    if (existingForm.status === 'published') {
      return NextResponse.json(
        errorResponse(
          ErrorCode.FORBIDDEN,
          'Cannot modify published forms'
        ),
        { status: 403 }
      )
    }

    // Validate request body
    const validationResult = CreateFormFieldSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        errorResponse(
          ErrorCode.VALIDATION_ERROR,
          validationResult.error.errors[0]?.message || 'Invalid input',
          validationResult.error.errors
        ),
        { status: 400 }
      )
    }

    // Create field
    const newField: NewFormField = {
      ...validationResult.data,
      formId,
      options: validationResult.data.options ? JSON.stringify(validationResult.data.options) : null,
    }

    const [created] = await db.insert(schema.formFields).values(newField).returning()

    return NextResponse.json(successResponse(created), { status: 201 })
  } catch (error) {
    console.error('Error creating field:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to create field'),
      { status: 500 }
    )
  }
}

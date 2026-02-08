import { NextRequest, NextResponse } from 'next/server'
import { getDb, schema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { successResponse, errorResponse, ErrorCode } from '@/lib/utils/api-response'
import type { NewFormField } from '@/lib/db/schema'

type FormResponseData = typeof schema.forms.$inferSelect & {
  fields?: typeof schema.formFields.$inferSelect[]
  shareableLink?: string
}

/**
 * GET /api/forms/:id - Get form details with fields
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = await getDb()
    const [form] = await db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.id, id))
      .limit(1)

    if (!form) {
      return NextResponse.json(
        errorResponse(ErrorCode.NOT_FOUND, 'Form not found'),
        { status: 404 }
      )
    }

    // Get fields ordered by order
    const fields = await db
      .select()
      .from(schema.formFields)
      .where(eq(schema.formFields.formId, id))
      .orderBy(schema.formFields.order)

    // Parse options from JSON strings with validation
    const fieldsWithParsedOptions = fields.map((field) => {
      if (!field.options) {
        return { ...field, options: undefined }
      }

      try {
        const parsed = JSON.parse(field.options)

        // Validation: must be a non-empty array
        if (!Array.isArray(parsed)) {
          throw new Error(`Field ${field.id} options is not an array`)
        }

        if (parsed.length === 0) {
          throw new Error(`Field ${field.id} options array is empty`)
        }

        // Validate each option has required properties
        for (let i = 0; i < parsed.length; i++) {
          const opt = parsed[i]
          if (!opt || typeof opt !== 'object') {
            throw new Error(`Field ${field.id} option at index ${i} is not an object`)
          }
          if (typeof opt.label !== 'string') {
            throw new Error(`Field ${field.id} option at index ${i} has invalid label`)
          }
          if (typeof opt.value !== 'string') {
            throw new Error(`Field ${field.id} option at index ${i} has invalid value`)
          }
        }

        return { ...field, options: parsed }
      } catch (err) {
        if (err instanceof SyntaxError) {
          throw new Error(`Field ${field.id} (${field.label}): Invalid JSON in options - ${err.message}`)
        }
        throw err
      }
    })

    // Add shareable link if published
    const responseData: FormResponseData = {
      ...form,
      fields: fieldsWithParsedOptions,
    }

    if (form.status === 'published' && form.slug) {
      responseData.shareableLink = `${request.nextUrl.origin}/forms/share/${form.slug}`
    }

    return NextResponse.json(successResponse(responseData))
  } catch (error) {
    console.error('Error getting form:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to get form'),
      { status: 500 }
    )
  }
}

/**
 * PUT /api/forms/:id - Update form metadata and fields (draft only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const db = await getDb()

    // Check if form exists
    const [existingForm] = await db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.id, id))
      .limit(1)

    if (!existingForm) {
      return NextResponse.json(
        errorResponse(ErrorCode.NOT_FOUND, 'Form not found'),
        { status: 404 }
      )
    }

    // Prevent editing published forms
    if (existingForm.status === 'published') {
      return NextResponse.json(
        errorResponse(
          ErrorCode.FORBIDDEN,
          'Cannot edit published forms'
        ),
        { status: 403 }
      )
    }

    // Validate form metadata
    const { title, description, fields } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        errorResponse(ErrorCode.VALIDATION_ERROR, 'Title is required'),
        { status: 400 }
      )
    }

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        errorResponse(ErrorCode.VALIDATION_ERROR, 'Fields must be an array'),
        { status: 400 }
      )
    }

    // Update form metadata
    const [updated] = await db
      .update(schema.forms)
      .set({
        title,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.forms.id, id))
      .returning()

    // Get existing fields
    const existingFields = await db
      .select()
      .from(schema.formFields)
      .where(eq(schema.formFields.formId, id))

    const existingFieldIds = new Set(existingFields.map((f) => f.id))

    // Delete all existing fields for this form
    await db.delete(schema.formFields).where(eq(schema.formFields.formId, id))

    // Insert all fields from the request
    for (const field of fields) {
      const optionsString = field.options ? JSON.stringify(field.options) : null

      const fieldData: NewFormField = {
        formId: id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || null,
        required: Boolean(field.required),
        options: optionsString,
        order: field.order,
      }

      // Preserve ID if it existed, otherwise let database generate
      if (field.id && existingFieldIds.has(field.id)) {
        fieldData.id = field.id
      }

      await db.insert(schema.formFields).values(fieldData)
    }

    // Get updated fields
    const updatedFields = await db
      .select()
      .from(schema.formFields)
      .where(eq(schema.formFields.formId, id))
      .orderBy(schema.formFields.order)

    // Parse options from JSON strings with validation
    const fieldsWithParsedOptions = updatedFields.map((field) => {
      if (!field.options) {
        return { ...field, options: undefined }
      }

      try {
        const parsed = JSON.parse(field.options)

        // Validation: must be a non-empty array
        if (!Array.isArray(parsed)) {
          throw new Error(`Field ${field.id} options is not an array`)
        }

        if (parsed.length === 0) {
          throw new Error(`Field ${field.id} options array is empty`)
        }

        // Validate each option has required properties
        for (let i = 0; i < parsed.length; i++) {
          const opt = parsed[i]
          if (!opt || typeof opt !== 'object') {
            throw new Error(`Field ${field.id} option at index ${i} is not an object`)
          }
          if (typeof opt.label !== 'string') {
            throw new Error(`Field ${field.id} option at index ${i} has invalid label`)
          }
          if (typeof opt.value !== 'string') {
            throw new Error(`Field ${field.id} option at index ${i} has invalid value`)
          }
        }

        return { ...field, options: parsed }
      } catch (err) {
        if (err instanceof SyntaxError) {
          throw new Error(`Field ${field.id} (${field.label}): Invalid JSON in options - ${err.message}`)
        }
        throw err
      }
    })

    // Return updated form with fields
    return NextResponse.json(
      successResponse({
        ...updated,
        fields: fieldsWithParsedOptions,
      })
    )
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to update form'),
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/forms/:id - Delete a form (draft and published)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = await getDb()

    // Check if form exists
    const [existingForm] = await db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.id, id))
      .limit(1)

    if (!existingForm) {
      return NextResponse.json(
        errorResponse(ErrorCode.NOT_FOUND, 'Form not found'),
        { status: 404 }
      )
    }

    // Delete form (cascade will delete fields, submissions)
    await db.delete(schema.forms).where(eq(schema.forms.id, id))

    return NextResponse.json(successResponse({ message: 'Form deleted successfully' }))
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to delete form'),
      { status: 500 }
    )
  }
}

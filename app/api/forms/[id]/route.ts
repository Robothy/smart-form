import { NextRequest, NextResponse } from 'next/server'
import { getDb, schema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, ErrorCode } from '@/lib/utils/api-response'
import type { NewFormField } from '@/lib/db/schema'

/**
 * GET /api/forms/:id - Get form details with fields
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = getDb()
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

    // Add shareable link if published
    const responseData: any = {
      ...form,
      fields,
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

    const db = getDb()

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
      const fieldData: NewFormField = {
        formId: id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || null,
        required: field.required ? 1 : 0,
        options: field.options ? JSON.stringify(field.options) : null,
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

    // Return updated form with fields
    return NextResponse.json(
      successResponse({
        ...updated,
        fields: updatedFields,
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
 * DELETE /api/forms/:id - Delete a form (draft only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const db = getDb()

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

    // Prevent deleting published forms
    if (existingForm.status === 'published') {
      return NextResponse.json(
        errorResponse(
          ErrorCode.FORBIDDEN,
          'Cannot delete published forms'
        ),
        { status: 403 }
      )
    }

    // Delete form (cascade will delete fields)
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

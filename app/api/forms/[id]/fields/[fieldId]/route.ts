import { NextRequest, NextResponse } from 'next/server'
import { getDb, schema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { UpdateFormFieldSchema, successResponse, errorResponse, ErrorCode } from '@/lib/utils/api-response'

/**
 * PUT /api/forms/:id/fields/:fieldId - Update a field
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id: formId, fieldId } = await params
    const body = await request.json()

    const db = getDb()

    // Check if form exists and is draft
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

    if (existingForm.status === 'published') {
      return NextResponse.json(
        errorResponse(
          ErrorCode.FORBIDDEN,
          'Cannot modify published forms'
        ),
        { status: 403 }
      )
    }

    // Check if field exists
    const [existingField] = await db
      .select()
      .from(schema.formFields)
      .where(eq(schema.formFields.id, fieldId))
      .limit(1)

    if (!existingField) {
      return NextResponse.json(
        errorResponse(ErrorCode.NOT_FOUND, 'Field not found'),
        { status: 404 }
      )
    }

    // Validate request body
    const validationResult = UpdateFormFieldSchema.safeParse(body)
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

    // Update field
    const updateData: Record<string, unknown> = {
      ...validationResult.data,
      updatedAt: new Date(),
    }

    if (validationResult.data.options) {
      updateData.options = JSON.stringify(validationResult.data.options)
    }

    const [updated] = await db
      .update(schema.formFields)
      .set(updateData)
      .where(eq(schema.formFields.id, fieldId))
      .returning()

    return NextResponse.json(successResponse(updated))
  } catch (error) {
    console.error('Error updating field:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to update field'),
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/forms/:id/fields/:fieldId - Delete a field
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id: formId, fieldId } = await params

    const db = getDb()

    // Check if form exists and is draft
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

    if (existingForm.status === 'published') {
      return NextResponse.json(
        errorResponse(
          ErrorCode.FORBIDDEN,
          'Cannot modify published forms'
        ),
        { status: 403 }
      )
    }

    // Delete field
    await db.delete(schema.formFields).where(eq(schema.formFields.id, fieldId))

    return NextResponse.json(successResponse({ message: 'Field deleted successfully' }))
  } catch (error) {
    console.error('Error deleting field:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to delete field'),
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { forms, formFields } from '@/lib/db/schema'
import { successResponse, errorResponse } from '@/lib/utils/api-response'

/**
 * GET /api/forms/share/:slug - Get published form by shareable slug
 * Public endpoint for accessing published forms via shareable link
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(errorResponse('VALIDATION_ERROR', 'Slug is required'), { status: 400 })
    }

    const db = getDb()

    if (!db) {
      return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Database not available'), { status: 500 })
    }

    // Get the form with matching slug
    const formResult = await db
      .select({
        id: forms.id,
        title: forms.title,
        description: forms.description,
        status: forms.status,
        slug: forms.slug,
        createdAt: forms.createdAt,
      })
      .from(forms)
      .where(eq(forms.slug, slug))
      .limit(1)

    if (formResult.length === 0) {
      console.error(`Form not found for slug: ${slug}`)
      return NextResponse.json(errorResponse('NOT_FOUND', 'Form not found'), { status: 404 })
    }

    const form = formResult[0]

    // Check if form is published
    if (form.status !== 'published') {
      console.error(`Form not published. Slug: ${slug}, Status: ${form.status}`)
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'This form is not published'),
        { status: 403 }
      )
    }

    // Get form fields ordered by order column
    const fieldsResult = await db
      .select({
        id: formFields.id,
        type: formFields.type,
        label: formFields.label,
        placeholder: formFields.placeholder,
        required: formFields.required,
        options: formFields.options,
        order: formFields.order,
      })
      .from(formFields)
      .where(eq(formFields.formId, form.id))
      .orderBy(formFields.order)

    // Parse options from JSON strings
    const fields = fieldsResult.map((field) => {
      try {
        return {
          ...field,
          options: field.options ? JSON.parse(field.options) : undefined,
        }
      } catch (err) {
        console.error(`Error parsing options for field ${field.id}:`, err)
        return {
          ...field,
          options: undefined,
        }
      }
    })

    console.log(`Successfully loaded form ${form.id} with slug ${slug}, ${fields.length} fields`)

    return NextResponse.json(
      successResponse({
        id: form.id,
        title: form.title,
        description: form.description,
        status: form.status,
        slug: form.slug,
        fields,
      })
    )
  } catch (error) {
    console.error('Error fetching form by slug:', error)
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch form'),
      { status: 500 }
    )
  }
}

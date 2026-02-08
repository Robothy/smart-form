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

    const db = await getDb()

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

    // Parse options from JSON strings with validation
    const fields = fieldsResult.map((field) => {
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

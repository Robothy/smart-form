import { NextRequest, NextResponse } from 'next/server'
import { getDb, schema } from '@/lib/db/client'
import { eq, count } from 'drizzle-orm'
import { successResponse, errorResponse, ErrorCode } from '@/lib/utils/api-response'
import type { NewForm, NewFormField } from '@/lib/db/schema'

type FormListData = typeof schema.forms.$inferSelect & {
  fieldsCount?: number
  submissionsCount?: number
  shareableLink?: string
}

/**
 * GET /api/forms - List all forms
 * Query params: status (optional) - filter by 'draft' or 'published'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const origin = request.nextUrl.origin

    const db = await getDb()
    let forms

    // Filter by status if provided
    if (status === 'draft' || status === 'published') {
      forms = await db
        .select()
        .from(schema.forms)
        .where(eq(schema.forms.status, status))
        .orderBy(schema.forms.createdAt)
    } else {
      forms = await db
        .select()
        .from(schema.forms)
        .orderBy(schema.forms.createdAt)
    }

    // Get total counts for all statuses (for the filter tabs)
    const [allForms, draftForms, publishedForms] = await Promise.all([
      db.select().from(schema.forms),
      db.select().from(schema.forms).where(eq(schema.forms.status, 'draft')),
      db.select().from(schema.forms).where(eq(schema.forms.status, 'published')),
    ])

    // Add fields count and submissions count for display
    const formsWithCounts = await Promise.all(
      forms.map(async (form) => {
        const [fieldsCountResult, submissionsCountResult] = await Promise.all([
          db
            .select({ count: count() })
            .from(schema.formFields)
            .where(eq(schema.formFields.formId, form.id)),
          db
            .select({ count: count() })
            .from(schema.formSubmissions)
            .where(eq(schema.formSubmissions.formId, form.id)),
        ])

        const result: FormListData = {
          ...form,
          fieldsCount: fieldsCountResult[0]?.count || 0,
          submissionsCount: submissionsCountResult[0]?.count || 0,
        }

        // Add shareable link for published forms
        if (form.status === 'published' && form.slug) {
          result.shareableLink = `${origin}/forms/share/${form.slug}`
        }

        return result
      })
    )

    return NextResponse.json(
      successResponse({
        forms: formsWithCounts,
        counts: {
          all: allForms.length,
          draft: draftForms.length,
          published: publishedForms.length,
        },
      })
    )
  } catch (error) {
    console.error('Error listing forms:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to list forms'),
      { status: 500 }
    )
  }
}

/**
 * POST /api/forms - Create a new form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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

    const db = await getDb()
    const newForm: NewForm = {
      title,
      description: description || null,
      status: 'draft',
    }

    const [created] = await db.insert(schema.forms).values(newForm).returning()

    // Insert fields
    const createdFields: NewFormField[] = []
    for (const field of fields) {
      const optionsString = field.options ? JSON.stringify(field.options) : null

      const fieldData: NewFormField = {
        formId: created.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || null,
        required: Boolean(field.required),
        options: optionsString,
        order: field.order,
      }
      const [insertedField] = await db.insert(schema.formFields).values(fieldData).returning()
      createdFields.push(insertedField)
    }

    // Parse options from JSON strings with validation
    const fieldsWithParsedOptions = createdFields.map((field) => {
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

    // Return form with fields
    return NextResponse.json(
      successResponse({
        ...created,
        fields: fieldsWithParsedOptions,
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to create form'),
      { status: 500 }
    )
  }
}

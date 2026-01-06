import { NextRequest, NextResponse } from 'next/server'
import { getDb, schema } from '@/lib/db/client'
import { eq, count } from 'drizzle-orm'
import { CreateFormSchema, UpdateFormSchema } from '@/lib/validation/schemas'
import { successResponse, errorResponse, ErrorCode } from '@/lib/utils/api-response'
import type { NewForm, NewFormField } from '@/lib/db/schema'

/**
 * GET /api/forms - List all forms
 * Query params: status (optional) - filter by 'draft' or 'published'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const origin = request.nextUrl.origin

    const db = getDb()
    let query = db.select().from(schema.forms).orderBy(schema.forms.createdAt)

    // Filter by status if provided
    if (status === 'draft' || status === 'published') {
      query = query.where(eq(schema.forms.status, status))
    }

    const forms = await query

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

        const result: any = {
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

    const db = getDb()
    const newForm: NewForm = {
      title,
      description: description || null,
      status: 'draft',
    }

    const [created] = await db.insert(schema.forms).values(newForm).returning()

    // Insert fields
    const createdFields: NewFormField[] = []
    for (const field of fields) {
      const fieldData: NewFormField = {
        formId: created.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || null,
        required: field.required ? 1 : 0,
        options: field.options ? JSON.stringify(field.options) : null,
        order: field.order,
      }
      const [insertedField] = await db.insert(schema.formFields).values(fieldData).returning()
      createdFields.push(insertedField)
    }

    // Return form with fields
    return NextResponse.json(
      successResponse({
        ...created,
        fields: createdFields,
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

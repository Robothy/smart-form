import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { forms, formFields } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * POST /api/forms/[id]/copy
 * Copy a form to create a new independent draft version
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const db = await getDb()

    // Get the source form
    const sourceFormList = await db
      .select({
        id: forms.id,
        title: forms.title,
        description: forms.description,
      })
      .from(forms)
      .where(eq(forms.id, id))
      .limit(1)

    if (sourceFormList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      )
    }

    const sourceForm = sourceFormList[0]

    // Get the source form fields
    const sourceFields = await db
      .select()
      .from(formFields)
      .where(eq(formFields.formId, id))
      .orderBy(formFields.order)

    // Create the new form copy
    const newFormId = crypto.randomUUID()
    const now = new Date()

    await db.insert(forms).values({
      id: newFormId,
      title: `Copy of ${sourceForm.title}`,
      status: 'draft',
      description: sourceForm.description,
      slug: null,
      createdAt: now,
      updatedAt: now,
    })

    // Copy all fields to the new form
    if (sourceFields.length > 0) {
      const fieldsToInsert = sourceFields.map((field) => ({
        id: crypto.randomUUID(),
        formId: newFormId,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options,
        order: field.order,
        createdAt: now,
        updatedAt: now,
      }))

      await db.insert(formFields).values(fieldsToInsert)
    }

    // Return the new form data
    return NextResponse.json({
      success: true,
      data: {
        id: newFormId,
        title: `Copy of ${sourceForm.title}`,
        status: 'draft',
        slug: null,
        fieldCount: sourceFields.length,
      },
    })
  } catch (error) {
    console.error('Error copying form:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to copy form' },
      { status: 500 }
    )
  }
}

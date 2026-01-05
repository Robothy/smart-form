import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { forms, formFields } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { generateSlugFromId } from '@/lib/utils/slug'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * POST /api/forms/[id]/publish
 * Publish a draft form by generating a unique slug and changing status to published
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const db = getDb()

    // Get form with field count
    const formList = await db
      .select({
        id: forms.id,
        title: forms.title,
        status: forms.status,
        description: forms.description,
        createdAt: forms.createdAt,
        updatedAt: forms.updatedAt,
      })
      .from(forms)
      .where(eq(forms.id, id))
      .limit(1)

    if (formList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      )
    }

    const form = formList[0]

    // Check if form is already published
    if (form.status === 'published') {
      return NextResponse.json(
        { success: false, error: 'Form is already published' },
        { status: 400 }
      )
    }

    // Get field count
    const fieldCountResult = await db
      .select({ count: formFields.id })
      .from(formFields)
      .where(eq(formFields.formId, id))

    const fieldCount = fieldCountResult.length

    if (fieldCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Add at least one field before publishing' },
        { status: 400 }
      )
    }

    // Generate slug from form ID (guaranteed unique)
    const slug = generateSlugFromId(id)

    // Update form to published
    const now = new Date()
    const updated = await db
      .update(forms)
      .set({
        status: 'published',
        slug: slug,
        publishedAt: now,
        updatedAt: now,
      })
      .where(and(eq(forms.id, id), eq(forms.status, 'draft')))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to publish form' },
        { status: 500 }
      )
    }

    const publishedForm = updated[0]

    // Construct share URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const shareUrl = `${protocol}://${host}/forms/share/${slug}`

    return NextResponse.json({
      success: true,
      data: {
        id: publishedForm.id,
        title: publishedForm.title,
        status: publishedForm.status,
        slug: publishedForm.slug,
        shareUrl: shareUrl,
        publishedAt: publishedForm.publishedAt,
        fieldCount: fieldCount,
      },
    })
  } catch (error) {
    console.error('Error publishing form:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate unique slug' },
      { status: 500 }
    )
  }
}

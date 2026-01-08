import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { forms } from '@/lib/db/schema'

/**
 * Shareable link page - looks up form by slug and redirects to fill page
 */
export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const db = await getDb()

    if (!db) {
      console.error('Database not available')
      redirect('/?error=db-unavailable')
    }

    // Look up the form by slug
    const result = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.slug, slug))
      .limit(1)

    if (result.length === 0) {
      // Form not found, redirect to home with error message
      console.error(`Form not found for slug: ${slug}`)
      redirect('/?error=form-not-found')
    }

    const formId = result[0].id
    console.log(`Found form ${formId} for slug ${slug}, redirecting to fill page`)

    // Redirect to the fill page - pass slug as query param for easier loading
    redirect(`/forms/${formId}/fill?slug=${encodeURIComponent(slug)}`)
  } catch (error) {
    // Next.js redirect throws an error with NEXT_REDIRECT prefix - this is expected
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error // Re-throw to allow redirect to complete
    }
    console.error('Error loading form by slug:', error)
    redirect('/?error=load-failed')
  }
}

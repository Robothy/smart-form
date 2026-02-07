'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormData } from '@/components/ui/FormBuilder'

interface UseFormPublishResult {
  publish: () => Promise<{ id: string; title: string; status: string; slug?: string | null }>
  isPublishing: boolean
  error: string | null
  clearError: () => void
}

export function useFormPublish(formId: string, form: FormData | null): UseFormPublishResult {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publish = async (): Promise<{ id: string; title: string; status: string; slug?: string | null }> => {
    if (!form || form.fields.length < 1) {
      setError('Add at least one field before publishing')
      throw new Error('Add at least one field before publishing')
    }

    setIsPublishing(true)
    setError(null)

    try {
      const response = await fetch(`/api/forms/${formId}/publish`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/forms/${formId}/view`)
        // Return the published form data
        return {
          id: result.data.id,
          title: result.data.title,
          status: result.data.status,
          slug: result.data.slug,
        }
      } else {
        setError(result.error?.message || 'Failed to publish form')
        throw new Error(result.error?.message || 'Failed to publish form')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form')
      throw err
    } finally {
      setIsPublishing(false)
    }
  }

  const clearError = () => setError(null)

  return { publish, isPublishing, error, clearError }
}

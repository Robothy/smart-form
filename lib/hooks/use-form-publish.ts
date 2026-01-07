'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormData } from '@/components/ui/FormBuilder'

interface UseFormPublishResult {
  publish: () => Promise<boolean>
  isPublishing: boolean
  error: string | null
  clearError: () => void
}

export function useFormPublish(formId: string, form: FormData | null): UseFormPublishResult {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publish = async (): Promise<boolean> => {
    if (!form || form.fields.length < 1) {
      setError('Add at least one field before publishing')
      return false
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
        return true
      } else {
        setError(result.error?.message || 'Failed to publish form')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form')
      return false
    } finally {
      setIsPublishing(false)
    }
  }

  const clearError = () => setError(null)

  return { publish, isPublishing, error, clearError }
}

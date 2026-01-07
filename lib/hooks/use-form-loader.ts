'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FormData } from '@/components/ui/FormBuilder'

interface UseFormLoaderResult {
  form: FormData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFormLoader(formId: string): UseFormLoaderResult {
  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadForm = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/forms/${formId}`, { signal })
      if (!response.ok) {
        throw new Error('Form not found')
      }

      const result = await response.json()
      if (result.success) {
        // Convert fields from API format to component format
        const fields = result.data.fields.map((field: { options: string | null } & Record<string, unknown>) => ({
          ...field,
          options: field.options ? JSON.parse(field.options) : undefined,
        }))

        setForm({
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          status: result.data.status,
          fields,
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [formId])

  useEffect(() => {
    const abortController = new AbortController()
    loadForm(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [loadForm])

  const refetch = useCallback(async () => {
    const abortController = new AbortController()
    await loadForm(abortController.signal)
  }, [loadForm])

  return { form, isLoading, error, refetch }
}

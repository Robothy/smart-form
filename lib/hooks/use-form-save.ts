'use client'

import { useState } from 'react'
import type { FormData } from '@/components/ui/FormBuilder'

interface UseFormSaveResult {
  save: (data: Omit<FormData, 'id' | 'status'>) => Promise<void>
  isSaving: boolean
  isSuccess: boolean
  error: string | null
  clearSuccess: () => void
  clearError: () => void
}

export function useFormSave(formId: string): UseFormSaveResult {
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async (data: Omit<FormData, 'id' | 'status'>) => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update form')
      }

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update form')
    } finally {
      setIsSaving(false)
    }
  }

  const clearSuccess = () => setIsSuccess(false)
  const clearError = () => setError(null)

  return { save, isSaving, isSuccess, error, clearSuccess, clearError }
}

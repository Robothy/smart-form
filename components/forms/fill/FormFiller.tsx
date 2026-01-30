'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Typography, Box, Alert, Button } from '@mui/material'
import { FormFieldRenderer, type FormFieldData } from './FormFieldRenderer'
import { FormLoadingState } from './FormLoadingState'
import { FormErrorState } from './FormErrorState'
import { FormSuccessState } from './FormSuccessState'
import { buttonStyles, flexStyles } from '@/theme'
import { usePageAiTools } from '@/app/forms/[id]/fill/ai-tools'

export interface FormFillerProps {
  formId?: string
  slug?: string
}

export interface FormData {
  id: string
  title: string
  description?: string
  status: 'draft' | 'published'
  slug?: string
  fields: FormFieldData[]
}

export function FormFiller({ formId, slug }: FormFillerProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [values, setValues] = useState<Record<string, string | string[]>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const targetId = formId || slug

  useEffect(() => {
    if (targetId) {
      loadForm()
    }
  }, [targetId])

  const loadForm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = slug ? `/api/forms/share/${slug}` : `/api/forms/${formId}`
      console.log(`FormFiller: Loading form from ${url}`)
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`FormFiller: API error response:`, errorData)
        throw new Error(errorData.error?.message || 'Failed to load form')
      }

      const result = await response.json()
      console.log(`FormFiller: API response:`, result)
      if (result.success) {
        setForm(result.data)
      } else {
        throw new Error(result.error?.message || 'Unknown error')
      }
    } catch (err) {
      console.error(`FormFiller: Error loading form:`, err)
      setError(err instanceof Error ? err.message : 'Failed to load form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleValueChange = (fieldId: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when user modifies the field
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setFieldErrors({})

    if (!form) return

    // Validate required fields
    const newErrors: Record<string, string> = {}
    for (const field of form.fields) {
      if (field.required && (!values[field.id!] || values[field.id!] === '')) {
        newErrors[field.id!] = `${field.label} is required`
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/forms/${form.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error?.details?.fieldId) {
          // Field-specific error
          setFieldErrors({ [errorData.error.details.fieldId]: errorData.error.message })
        } else {
          throw new Error(errorData.error?.message || 'Failed to submit form')
        }
      } else {
        setIsSuccess(true)
        // Clear form values
        setValues({})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Register AI tools for this page (ALWAYS call this hook, even during loading/error/success)
  // The hook handles null form gracefully
  usePageAiTools({
    form: form ? {
      id: form.id,
      title: form.title,
      fields: form.fields,
    } : undefined,
    values: Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v])
    ) as Record<string, string>,
    errors: fieldErrors,
    onValueChange: (fieldId: string, value: string) => handleValueChange(fieldId, value),
    onSubmit: async () => {
      await handleSubmit(new Event('submit') as unknown as React.FormEvent)
    },
  })

  // Loading state
  if (isLoading) {
    return <FormLoadingState />
  }

  // Error state
  if (error) {
    return <FormErrorState error={error} onGoBack={() => router.back()} />
  }

  // Success state
  if (isSuccess) {
    return (
      <FormSuccessState
        onSubmitAnother={() => {
          setIsSuccess(false)
          setValues({})
        }}
        onReturnHome={() => router.push('/')}
      />
    )
  }

  // Form not loaded
  if (!form) {
    return null
  }

  // Main form state
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom sx={{ color: '#f1f5f9', fontWeight: 700 }}>
          {form.title}
        </Typography>

        {form.description && (
          <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4 }} paragraph>
            {form.description}
          </Typography>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 2,
              color: '#ef4444',
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ flexDirection: 'column', ...flexStyles.gap.md }}>
          {form.fields.map((field) => (
            <FormFieldRenderer
              key={field.id || field.order}
              field={field}
              value={values[field.id!] as string | string[] || ''}
              error={fieldErrors[field.id!]}
              onChange={handleValueChange}
            />
          ))}

          {form.fields.length === 0 && (
            <Alert
              severity="info"
              sx={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 2,
                color: '#3b82f6',
              }}
            >
              This form has no fields to fill out.
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting || form.fields.length === 0}
            sx={{
              fontSize: '1rem',
              py: 1.5,
              ...buttonStyles.primary,
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#64748b',
                boxShadow: 'none',
              },
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

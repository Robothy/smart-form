'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Container, Typography, Box, Alert, CircularProgress, Button } from '@mui/material'
import { FormInput } from '@/components/ui/FormInput'
import type { FormFieldData } from '@/components/ui/FormBuilder'
import { buttonStyles, flexStyles } from '@/theme'

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

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, ...flexStyles.center, flexDirection: 'column' }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
        <Typography sx={{ mt: 2, color: '#94a3b8' }}>Loading form...</Typography>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 2,
            color: '#ef4444',
          }}
        >
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          sx={{
            ...buttonStyles.ghost,
          }}
        >
          Go Back
        </Button>
      </Container>
    )
  }

  if (isSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8, ...flexStyles.center, flexDirection: 'column' }}>
        <Alert
          severity="success"
          sx={{
            mb: 4,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 2,
            color: '#10b981',
          }}
        >
          Thank you! Your form has been submitted successfully.
        </Alert>
        <Box sx={{ ...flexStyles.gap.sm, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => {
              setIsSuccess(false)
              setValues({})
            }}
            sx={buttonStyles.primary}
          >
            Submit Another Response
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/')}
            sx={buttonStyles.ghost}
          >
            Return Home
          </Button>
        </Box>
      </Container>
    )
  }

  if (!form) {
    return null
  }

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

        <Box sx={{ display: 'flex', flexDirection: 'column', ...flexStyles.gap.md }}>
          {form.fields.map((field) => (
            <Box key={field.id || field.order}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 500, color: '#f1f5f9' }}
                id={`${field.id!}-label`}
              >
                {field.label}
                {field.required && <span style={{ color: '#10b981' }}> *</span>}
              </Typography>

              {field.type === 'text' && (
                <FormInput
                  value={values[field.id!] as string || ''}
                  onChange={(e) => handleValueChange(field.id!, e.target.value)}
                  placeholder={field.placeholder}
                  error={fieldErrors[field.id!]}
                  id={field.id!}
                  aria-labelledby={`${field.id!}-label`}
                  aria-required={field.required}
                />
              )}

              {field.type === 'textarea' && (
                <FormInput
                  multiline
                  rows={4}
                  value={values[field.id!] as string || ''}
                  onChange={(e) => handleValueChange(field.id!, e.target.value)}
                  placeholder={field.placeholder}
                  error={fieldErrors[field.id!]}
                  id={field.id!}
                  aria-labelledby={`${field.id!}-label`}
                  aria-required={field.required}
                />
              )}

              {field.type === 'date' && (
                <FormInput
                  type="date"
                  value={values[field.id!] as string || ''}
                  onChange={(e) => handleValueChange(field.id!, e.target.value)}
                  error={fieldErrors[field.id!]}
                  id={field.id!}
                  aria-labelledby={`${field.id!}-label`}
                  aria-required={field.required}
                />
              )}

              {field.type === 'radio' && (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  role="radiogroup"
                  aria-labelledby={`${field.id!}-label`}
                  aria-required={field.required}
                  aria-invalid={!!fieldErrors[field.id!]}
                >
                  {field.options?.map((option) => (
                    <label
                      key={option.value}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#f1f5f9' }}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        id={`${field.id!}-${option.value}`}
                        value={option.value}
                        checked={values[field.id!] === option.value}
                        onChange={(e) => handleValueChange(field.id!, e.target.value)}
                        aria-label={option.label}
                        style={{
                          accentColor: '#6366f1',
                          width: 18,
                          height: 18,
                          cursor: 'pointer',
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                  {fieldErrors[field.id!] && (
                    <Typography variant="caption" role="alert" id={`${field.id!}-error`} sx={{ color: '#ef4444' }}>
                      {fieldErrors[field.id!]}
                    </Typography>
                  )}
                </Box>
              )}

              {field.type === 'checkbox' && (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  role="group"
                  aria-labelledby={`${field.id!}-label`}
                  aria-required={field.required}
                  aria-invalid={!!fieldErrors[field.id!]}
                >
                  {field.options?.map((option) => (
                    <label
                      key={option.value}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#f1f5f9' }}
                    >
                      <input
                        type="checkbox"
                        name={field.id}
                        id={`${field.id!}-${option.value}`}
                        value={option.value}
                        checked={Array.isArray(values[field.id!]) && (values[field.id!] as string[]).includes(option.value)}
                        onChange={(e) => {
                          const currentValues = (values[field.id!] as string[]) || []
                          if (e.target.checked) {
                            handleValueChange(field.id!, [...currentValues, option.value])
                          } else {
                            handleValueChange(field.id!, currentValues.filter((v: string) => v !== option.value))
                          }
                        }}
                        aria-label={option.label}
                        style={{
                          accentColor: '#6366f1',
                          width: 18,
                          height: 18,
                          cursor: 'pointer',
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                  {fieldErrors[field.id!] && (
                    <Typography variant="caption" role="alert" id={`${field.id!}-error`} sx={{ color: '#ef4444' }}>
                      {fieldErrors[field.id!]}
                    </Typography>
                  )}
                </Box>
              )}

              {fieldErrors[field.id!] && field.type !== 'radio' && field.type !== 'checkbox' && (
                <Typography variant="caption" role="alert" id={`${field.id!}-error`} sx={{ mt: 0.5, color: '#ef4444' }}>
                  {fieldErrors[field.id!]}
                </Typography>
              )}
            </Box>
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Container, Typography, Box, Alert, CircularProgress, Snackbar } from '@mui/material'
import { FormBuilder, type FormData } from '@/components/ui/FormBuilder'
import { Button } from '@/components/ui/Button'
import { EditToolbar } from '@/components/forms/EditToolbar'
import Link from 'next/link'
import { flexStyles } from '@/theme'

/**
 * Form edit page - edit an existing draft form
 */
export default function EditFormPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string

  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const abortController = new AbortController()
    loadForm(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [formId])

  // Redirect to view page if form is already published
  useEffect(() => {
    if (form && form.status === 'published') {
      router.replace(`/forms/${formId}/view`)
    }
  }, [form, formId, router])

  const loadForm = async (signal: AbortSignal) => {
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
        const fields = result.data.fields.map((field: any) => ({
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
  }

  const handleSave = async (data: Omit<FormData, 'id' | 'status'>) => {
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

  const handleUpdate = (updated: FormData) => {
    setForm(updated)
  }

  const handlePublish = async () => {
    if (!form || form.fields.length < 1) {
      setError('Add at least one field before publishing')
      return
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
      } else {
        setError(result.error?.message || 'Failed to publish form')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form')
    } finally {
      setIsPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading form...</Typography>
      </Container>
    )
  }

  if (error && !form) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Link href="/forms">
            <Button variant="outlined">Back to Forms</Button>
          </Link>
        </Box>
      </Container>
    )
  }

  if (!form) {
    return null
  }

  // Check if form is published (read-only mode)
  const isPublished = form.status === 'published'

  return (
    <>
      {/* Sticky toolbar - outside container to stick at top */}
      {!isPublished && (
        <EditToolbar
          title={form.title || 'Untitled form'}
          subtitle={`Draft • ${form.fields.length} field${form.fields.length === 1 ? '' : 's'}`}
          onSave={() => handleSave({ title: form.title, description: form.description, fields: form.fields })}
          onPublish={handlePublish}
          isSaving={isSaving}
          isPublishing={isPublishing}
          hasFields={form.fields.length > 0}
        />
      )}

      <Container maxWidth="md" sx={{ py: 4, mt: isPublished ? 0 : 10 }}>
        {isPublished && (
          <Box sx={{ mb: 4, ...flexStyles.between }}>
            <Typography variant="h4">
              View Form (Read-Only)
            </Typography>
            <Link href="/forms">
              <Button variant="outlined">Back to Forms</Button>
            </Link>
          </Box>
        )}

        {isPublished && (
          <Alert severity="info" sx={{ mb: 4 }}>
            This form is published and cannot be edited. Published forms are read-only.
          </Alert>
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

        <FormBuilder
          form={form}
          onSave={handleSave}
          onUpdate={handleUpdate}
          readonly={isPublished}
          showSaveButton={false}
          showHeading={false}
        />
      </Container>

      <Snackbar
        open={isSuccess}
        autoHideDuration={2000}
        onClose={() => setIsSuccess(false)}
        message="Form updated successfully!"
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </>
  )
}

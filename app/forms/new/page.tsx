'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Typography, Box, Alert, CircularProgress, Button } from '@mui/material'
import { FormBuilder, type FormData } from '@/components/ui/FormBuilder'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import { buttonStyles } from '@/theme'
import { PageToolbar } from '@/components/forms/list/PageToolbar'
import { useFormTools } from '@/lib/copilotkit/form-tools'
import { useCopilotReadable } from '@copilotkit/react-core'

/**
 * Form creation page - create a new form with fields
 */
export default function NewFormPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    status: 'draft',
    fields: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Use a ref to track the latest form state synchronously for the tools
  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])

  // Register form editing tools
  useFormTools({
    onUpdateForm: (updates) => {
      const current = formRef.current
      let updated: FormData

      if (typeof updates === 'function') {
        const result = updates({
          title: current.title,
          description: current.description,
          fields: current.fields,
        })
        updated = {
          ...current,
          ...(result.title !== undefined && { title: result.title }),
          ...(result.description !== undefined && { description: result.description }),
          ...(result.fields !== undefined && { fields: result.fields }),
        }
      } else {
        updated = {
          ...current,
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.fields !== undefined && { fields: updates.fields }),
        }
      }

      // Update the ref immediately to avoid race conditions
      formRef.current = updated
      setForm(updated)
    },
    getCurrentState: () => ({
      title: formRef.current.title,
      description: formRef.current.description,
      fields: formRef.current.fields,
    }),
  })

  // Share form state with the assistant
  useCopilotReadable({
    description: 'New form being created including title, description, and all fields',
    value: JSON.stringify({
      title: form.title,
      description: form.description,
      status: form.status,
      fields: form.fields.map((f) => ({
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        options: f.options,
      })),
    }),
  })

  const handleSave = async (data: Omit<FormData, 'id' | 'status'>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create form')
      }

      const result = await response.json()
      if (result.success) {
        setIsSuccess(true)
        // Redirect to edit page after short delay
        setTimeout(() => {
          router.push(`/forms/${result.data.id}/edit`)
        }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = (updated: FormData) => {
    setForm(updated)
  }

  if (isSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 4 }}>
          Form created successfully! Redirecting to edit page...
        </Alert>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <PageToolbar
        title="Create New Form"
        subtitle={`Draft • ${form.fields.length} field${form.fields.length !== 1 ? 's' : ''}`}
        actions={
          <>
            <Link href="/forms" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: 999,
                  px: 2.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f1f5f9',
                  background: 'rgba(255, 255, 255, 0.02)',
                  '&:hover': {
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    background: 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                Cancel
              </Button>
            </Link>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={() => handleSave({ title: form.title, description: form.description, fields: form.fields })}
              disabled={isLoading || !form.title.trim()}
              sx={{ ...buttonStyles.primary, borderRadius: 999 }}
            >
              {isLoading ? 'Creating…' : 'Create Form'}
            </Button>
          </>
        }
      />

      <Container maxWidth="md" sx={{ py: 4, mt: 10 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormBuilder
          form={form}
          onSave={handleSave}
          onUpdate={handleUpdate}
          showSaveButton={false}
          showHeading={false}
        />
      </Container>
    </>
  )
}

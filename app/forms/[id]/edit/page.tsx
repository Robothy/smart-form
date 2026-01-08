'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Container, Typography, Box, Alert } from '@mui/material'

import { FormBuilder, type FormData } from '@/components/ui/FormBuilder'
import { Button } from '@/components/ui/Button'
import { EditToolbar } from '@/components/forms/edit/EditToolbar'
import { FormLoadingState } from '@/components/forms/edit/FormLoadingState'
import { SuccessSnackbar } from '@/components/forms/edit/SuccessSnackbar'
import { useFormLoader } from '@/lib/hooks/use-form-loader'
import { useFormSave } from '@/lib/hooks/use-form-save'
import { useFormPublish } from '@/lib/hooks/use-form-publish'
import { flexStyles } from '@/theme'

/**
 * Form edit page - edit an existing draft form
 */
export default function EditFormPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string

  // Local state to track form changes from FormBuilder
  const [form, setForm] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Custom hooks
  const { form: loadedForm, isLoading, error: loadError } = useFormLoader(formId)
  const { save, isSaving, isSuccess, error: saveError, clearSuccess, clearError: clearSaveError } = useFormSave(formId)
  const { publish, isPublishing, error: publishError, clearError: clearPublishError } = useFormPublish(formId, form)

  // Update local form state when loadedForm changes
  useEffect(() => {
    if (loadedForm) {
      setForm(loadedForm)
    }
  }, [loadedForm])

  // Redirect to view page if form is already published
  useEffect(() => {
    if (form && form.status === 'published') {
      router.replace(`/forms/${formId}/view`)
    }
  }, [form, formId, router])

  // Consolidate errors from hooks
  useEffect(() => {
    if (saveError) setError(saveError)
    if (publishError) setError(publishError)
  }, [saveError, publishError])

  const handleSave = async (data: Omit<FormData, 'id' | 'status'>) => {
    setError(null)
    clearPublishError()
    await save(data)
  }

  const handleUpdate = (updated: FormData) => {
    // Sync the form state from FormBuilder to parent
    setForm(updated)
  }

  const handlePublish = async () => {
    setError(null)
    clearSaveError()
    await publish()
  }

  const handleCloseSnackbar = () => {
    clearSuccess()
  }

  const handleCloseAlert = () => {
    setError(null)
    clearSaveError()
    clearPublishError()
  }

  // Show loading or error state
  const loadingState = <FormLoadingState isLoading={isLoading} error={loadError} form={form} />
  if (isLoading || loadError || !form) {
    return loadingState
  }

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
            <Typography variant="h4">View Form (Read-Only)</Typography>
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
            onClose={handleCloseAlert}
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

      <SuccessSnackbar open={isSuccess} onClose={handleCloseSnackbar} />
    </>
  )
}

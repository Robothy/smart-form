'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Typography, Box, Alert, CircularProgress, Button, Stack } from '@mui/material'
import { FormBuilder, type FormData } from '@/components/ui/FormBuilder'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'

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
      <Box
        sx={(theme) => ({
          position: 'fixed',
          top: { xs: 56, sm: 64 },
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar - 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(6px)',
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        })}
      >
        <Box
          sx={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1.25,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              Create New Form
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Draft • {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Link href="/forms" passHref legacyBehavior>
              <Button
                component="a"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 999, px: 2.5 }}
              >
                Cancel
              </Button>
            </Link>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={() => handleSave({ title: form.title, description: form.description, fields: form.fields })}
              disabled={isLoading || !form.title.trim()}
              sx={{ borderRadius: 999, px: 3 }}
            >
              {isLoading ? 'Creating…' : 'Create Form'}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 4, mt: 18 }}>

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

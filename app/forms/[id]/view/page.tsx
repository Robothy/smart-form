'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  TextField,
  IconButton,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
} from '@mui/icons-material'
import { FormStatusBadge } from '@/components/forms/FormStatusBadge'
import { ShareLinkDisplay } from '@/components/forms/ShareLinkDisplay'
import { CopyFormButton } from '@/components/forms/CopyFormButton'
import { DeleteConfirmationDialog } from '@/components/forms/DeleteConfirmationDialog'
import type { FormData, FormFieldData } from '@/components/ui/FormBuilder'

/**
 * Form view page - view published form details and submissions
 */
export default function ViewFormPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string

  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [shareableLink, setShareableLink] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    loadForm(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [formId])

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
        setForm(result.data)
        // Use shareableLink from API, or construct it from slug
        if (result.data.shareableLink) {
          setShareableLink(result.data.shareableLink)
        } else if (result.data.slug) {
          setShareableLink(`${window.location.origin}/forms/share/${result.data.slug}`)
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!form) return

    setIsPublishing(true)
    setError(null)

    try {
      const response = await fetch(`/api/forms/${formId}/publish`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to publish form')
      }

      const result = await response.json()
      if (result.success) {
        setShareableLink(result.data.shareableLink)
        setForm({ ...form, status: 'published', slug: result.data.slug })
        setPublishSuccess(true)
        setTimeout(() => setPublishSuccess(false), 5000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyError = (error: string) => {
    setError(error)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error?.message || 'Failed to delete form')
      }

      setDeleteDialogOpen(false)
      router.push('/forms')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete form')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false)
    setDeleteError(null)
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
          <Button variant="outlined" onClick={() => router.push('/forms')}>
            Back to Forms
          </Button>
        </Box>
      </Container>
    )
  }

  if (!form) {
    return null
  }

  const isPublished = form.status === 'published'

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
              {form.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {isPublished ? 'Published' : 'Draft'} • {form.fields?.length || 0} field{(form.fields?.length || 0) !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/forms')}
              sx={{ borderRadius: 999, px: 2.5 }}
            >
              Back
            </Button>
            {isPublished && shareableLink && (
              <Button
                variant="outlined"
                startIcon={copied ? <CopyIcon /> : <ShareIcon />}
                onClick={handleCopyLink}
                sx={{ borderRadius: 999, px: 2.5 }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            )}
            {isPublished && (
              <CopyFormButton
                formId={formId}
                onError={handleCopyError}
              />
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{ borderRadius: 999, px: 2.5 }}
            >
              Delete
            </Button>
            {isPublished && (
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => router.push(`/forms/${formId}/submissions`)}
                sx={{ borderRadius: 999, px: 3 }}
              >
                View Submissions
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 4, mt: 18 }}>
      <Stack spacing={3}>
        {/* Share Link Display at the top - only for published forms */}
        <ShareLinkDisplay
          slug={form.slug ?? null}
          shareUrl={shareableLink || null}
          formStatus={form.status}
        />

        {/* Header - simplified */}
        <Box>
          {form.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {form.description}
            </Typography>
          )}
        </Box>

        {publishSuccess && (
          <Alert severity="success" onClose={() => setPublishSuccess(false)}>
            Form published successfully! Your shareable link is ready.
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form details */}
        <Paper sx={{ p: 4 }}>
          {form.fields && form.fields.length > 0 ? (
            <Stack spacing={2}>
              {form.fields.map((field, index) => (
                <Box
                  key={field.id || index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2">
                    {index + 1}. {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Chip label={field.type} size="small" variant="outlined" />
                    <Chip label={field.required ? 'Required' : 'Optional'} size="small" />
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Alert severity="info">No fields added to this form yet.</Alert>
          )}
        </Paper>

        {/* Publish/Share section */}
        {!isPublished && (
          <Paper sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Publish Form</Typography>
              <Typography variant="body2" color="text.secondary">
                Publishing will generate a shareable link and make the form available to users.
                Published forms become read-only.
              </Typography>
              {(!form.fields || form.fields.length === 0) && (
                <Alert severity="warning">
                  You need to add at least one field before publishing this form.
                </Alert>
              )}
              <Button
                variant="contained"
                onClick={handlePublish}
                disabled={isPublishing || !form.fields || form.fields.length === 0}
              >
                {isPublishing ? 'Publishing...' : 'Publish Form'}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Edit button for draft forms */}
        {!isPublished && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => router.push(`/forms/${formId}/edit`)}
          >
            Edit Form
          </Button>
        )}

        {/* Delete confirmation dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          formTitle={form.title}
          submissionsCount={form.fields?.length || 0}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />

        {deleteError && (
          <Alert severity="error" onClose={() => setDeleteError(null)}>
            {deleteError}
          </Alert>
        )}
      </Stack>
    </Container>
    </>
  )
}

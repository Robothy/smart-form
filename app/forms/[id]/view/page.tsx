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
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
} from '@mui/icons-material'
import { ShareLinkDisplay } from '@/components/forms/view/ShareLinkDisplay'
import { CopyFormButton } from '@/components/forms/view/CopyFormButton'
import { DeleteConfirmationDialog } from '@/components/forms/view/DeleteConfirmationDialog'
import { PageToolbar } from '@/components/forms/list/PageToolbar'
import type { FormData } from '@/components/ui/FormBuilder'
import { buttonStyles, layoutStyles, flexStyles } from '@/theme'
import { useViewFormTools } from '@/lib/copilotkit'

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

  // Register view form tools
  useViewFormTools({
    form,
    formId,
    onViewSubmissions: () => router.push(`/forms/${formId}/submissions`),
    onEditForm: () => router.push(`/forms/${formId}/edit`),
  })

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
      <PageToolbar
        title={form.title}
        subtitle={`${isPublished ? 'Published' : 'Draft'} • ${form.fields?.length || 0} field${(form.fields?.length || 0) !== 1 ? 's' : ''}`}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/forms')}
              sx={{ ...buttonStyles.ghost, borderRadius: 999, px: 2.5, fontSize: '0.875rem' }}
            >
              Back
            </Button>
            {isPublished && shareableLink && (
              <Button
                variant="outlined"
                startIcon={copied ? <CopyIcon /> : <ShareIcon />}
                onClick={handleCopyLink}
                sx={{ ...buttonStyles.ghost, borderRadius: 999, px: 2.5, fontSize: '0.875rem' }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            )}
            {isPublished && (
              <CopyFormButton formId={formId} onError={handleCopyError} />
            )}
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{ ...buttonStyles.danger, borderRadius: 999, px: 2.5, fontSize: '0.875rem' }}
            >
              Delete
            </Button>
            {isPublished && (
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => router.push(`/forms/${formId}/submissions`)}
                sx={{ ...buttonStyles.primary, borderRadius: 999 }}
              >
                View Submissions
              </Button>
            )}
          </>
        }
      />

      <Container maxWidth="md" sx={{ py: 4, mt: 10 }}>
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
              <Typography
                variant="body1"
                sx={{ color: '#94a3b8', lineHeight: 1.7 }}
                paragraph
              >
                {form.description}
              </Typography>
            )}
          </Box>

          {publishSuccess && (
            <Alert
              severity="success"
              sx={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 2,
                color: '#10b981',
              }}
              onClose={() => setPublishSuccess(false)}
            >
              Form published successfully! Your shareable link is ready.
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
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

          {/* Form details */}
          <Paper
            sx={{
              p: 4,
              ...layoutStyles.glassSurface,
              borderRadius: 2,
            }}
          >
            {form.fields && form.fields.length > 0 ? (
              <Stack spacing={2}>
                {form.fields.map((field, index) => (
                  <Box
                    key={field.id || index}
                    sx={{
                      p: 2.5,
                      border: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderColor: 'rgba(99, 102, 241, 0.2)',
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1rem' }}
                    >
                      {index + 1}. {field.label}
                      {field.required && <span style={{ color: '#10b981' }}> *</span>}
                    </Typography>
                    <Box sx={{ ...flexStyles.gap.sm, mt: 1.5 }}>
                      <Chip
                        label={field.type}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: '#6366f1',
                          height: 24,
                        }}
                      />
                      <Chip
                        label={field.required ? 'Required' : 'Optional'}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: field.required
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: field.required
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          color: field.required ? '#10b981' : '#94a3b8',
                          height: 24,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Alert
                severity="info"
                sx={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 2,
                  color: '#3b82f6',
                }}
              >
                No fields added to this form yet.
              </Alert>
            )}
          </Paper>

          {/* Publish/Share section */}
          {!isPublished && (
            <Paper
              sx={{
                p: 4,
                ...layoutStyles.glassSurface,
                borderRadius: 2,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                  Publish Form
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7 }}>
                  Publishing will generate a shareable link and make the form available to
                  users. Published forms become read-only.
                </Typography>
                {(!form.fields || form.fields.length === 0) && (
                  <Alert
                    severity="warning"
                    sx={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 2,
                      color: '#f59e0b',
                    }}
                  >
                    You need to add at least one field before publishing this form.
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={handlePublish}
                  disabled={isPublishing || !form.fields || form.fields.length === 0}
                  sx={{
                    ...buttonStyles.success,
                    py: 1.5,
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#64748b',
                      boxShadow: 'none',
                    },
                  }}
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
              sx={{ ...buttonStyles.primary, py: 1.5 }}
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
            <Alert
              severity="error"
              sx={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 2,
                color: '#ef4444',
              }}
              onClose={() => setDeleteError(null)}
            >
              {deleteError}
            </Alert>
          )}
        </Stack>
      </Container>
    </>
  )
}

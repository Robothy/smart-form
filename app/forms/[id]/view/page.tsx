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
} from '@mui/material'
import { ContentCopy as CopyIcon } from '@mui/icons-material'
import { FormStatusBadge } from '@/components/forms/FormStatusBadge'
import { ShareLinkDisplay } from '@/components/forms/ShareLinkDisplay'
import { CopyFormButton } from '@/components/forms/CopyFormButton'
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

  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/forms/${formId}`)
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
      setError(err instanceof Error ? err.message : 'Failed to load form')
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Share Link Display at the top - only for published forms */}
        <ShareLinkDisplay
          slug={form.slug ?? null}
          shareUrl={shareableLink || null}
          formStatus={form.status}
        />

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {form.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormStatusBadge status={form.status} />
              {isPublished && (
                <Chip label={`${form.fields?.length || 0} field${(form.fields?.length || 0) !== 1 ? 's' : ''}`} size="small" />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {isPublished && (
              <CopyFormButton
                formId={formId}
                onError={handleCopyError}
              />
            )}
            <Button variant="outlined" onClick={() => router.push('/forms')}>
              Back to Forms
            </Button>
          </Box>
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
          {form.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {form.description}
            </Typography>
          )}

          <Typography variant="h6" gutterBottom>
            Form Fields ({form.fields?.length || 0})
          </Typography>

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
        <Paper sx={{ p: 4 }}>
          {isPublished ? (
            <Stack spacing={2}>
              <Typography variant="h6">Shareable Link</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={shareableLink}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleCopyLink}
                  startIcon={<CopyIcon />}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </Box>
              <Button
                variant="outlined"
                href={shareableLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Form Link
              </Button>
            </Stack>
          ) : (
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
          )}
        </Paper>

        {/* View submissions button for published forms */}
        {isPublished && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => router.push(`/forms/${formId}/submissions`)}
          >
            View Submissions
          </Button>
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
      </Stack>
    </Container>
  )
}

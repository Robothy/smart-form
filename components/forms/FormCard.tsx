'use client'

import { Card, CardContent, CardActions, Typography, Chip, Box, IconButton, Alert, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FormStatusBadge } from './FormStatusBadge'
import { ShareIconButton } from './ShareIconButton'
import { Button } from '@/components/ui/Button'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

export interface FormCardProps {
  id: string
  title: string
  status: 'draft' | 'published'
  description?: string
  fieldsCount: number
  submissionsCount: number
  shareableLink?: string
  slug?: string | null
  onClick: () => void
  onDeleted?: () => void
}

export function FormCard({
  id,
  title,
  status,
  description,
  fieldsCount,
  submissionsCount,
  shareableLink,
  slug,
  onClick,
  onDeleted,
}: FormCardProps) {
  const router = useRouter()
  const isPublished = status === 'published'

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPublished) {
      router.push(`/forms/${id}/submissions`)
    } else {
      router.push(`/forms/${id}/edit`)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error?.message || 'Failed to delete form')
      }

      setDeleteDialogOpen(false)
      onDeleted?.()
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

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
        onClick={onClick}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
            <Typography variant="h6" component="h2" sx={{ flex: 1, mr: 1.5, fontWeight: 600, lineHeight: 1.3 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
              <FormStatusBadge status={status} />
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                color="error"
                aria-label="Delete form"
                sx={{ ml: 0.25 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${fieldsCount} field${fieldsCount !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
            <Chip
              label={`${submissionsCount} submission${submissionsCount !== 1 ? 's' : ''}`}
              size="small"
              color={submissionsCount > 0 ? 'primary' : 'default'}
              variant={submissionsCount > 0 ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <ShareIconButton
              slug={slug || null}
              shareUrl={shareableLink || null}
              formStatus={status}
            />
            <Button variant="outlined" onClick={handleButtonClick} sx={{ flex: 1 }}>
              {isPublished ? 'View Submissions' : 'Edit Form'}
            </Button>
          </Box>
        </CardActions>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        formTitle={title}
        submissionsCount={submissionsCount}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {deleteError && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}
    </>
  )
}

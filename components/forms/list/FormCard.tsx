'use client'

import { Card, CardContent, CardActions, Typography, Chip, Box, IconButton, Alert, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FormStatusBadge } from '../view/FormStatusBadge'
import { ShareIconButton } from '../view/ShareIconButton'
import { Button } from '@/components/ui/Button'
import { DeleteConfirmationDialog } from '../view/DeleteConfirmationDialog'
import { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import { flexStyles } from '@/theme'

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
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(26, 26, 36, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: isPublished
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            '&::before': {
              opacity: 1,
            },
          },
        }}
        onClick={onClick}
      >
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Box sx={flexStyles.between}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                flex: 1,
                mr: 2,
                fontWeight: 700,
                fontSize: '1.125rem',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                color: '#f1f5f9',
              }}
            >
              {title}
            </Typography>
            <Box sx={{...flexStyles.gap.sm, flexShrink: 0}}>
              <FormStatusBadge status={status} />
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                aria-label="Delete form"
                sx={{
                  ml: 0.25,
                  color: '#94a3b8',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {description && (
            <Typography
              variant="body2"
              sx={{
                mb: 2.5,
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </Typography>
          )}

          <Box sx={{mt: 'auto', ...flexStyles.gap.sm, flexWrap: 'wrap'}}>
            <Chip
              label={`${fieldsCount} field${fieldsCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                height: 24,
              }}
            />
            <Chip
              label={`${submissionsCount} submission${submissionsCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                background: submissionsCount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: submissionsCount > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: submissionsCount > 0 ? '#10b981' : '#94a3b8',
                height: 24,
              }}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0, px: 2.5, pb: 2.5 }}>
          <Box sx={{...flexStyles.gap.sm, alignItems: 'center', width: '100%'}}>
            <ShareIconButton
              slug={slug || null}
              shareUrl={shareableLink || null}
              formStatus={status}
            />
            <Button
              variant="outlined"
              onClick={handleButtonClick}
              sx={{
                flex: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f1f5f9',
                background: 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
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

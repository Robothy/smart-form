'use client'

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import PublishIcon from '@mui/icons-material/Publish'
import SaveIcon from '@mui/icons-material/Save'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ReplayIcon from '@mui/icons-material/Replay'
import { layoutStyles, buttonStyles } from '@/theme'

interface EditToolbarProps {
  title: string
  subtitle?: string
  onSave: () => void
  onPublish: () => void
  onPreview?: () => void
  onDiscard?: () => void
  isSaving?: boolean
  isPublishing?: boolean
  hasFields?: boolean
}

/**
 * Sticky toolbar for the form edit page
 * Contains Publish and Save Changes buttons that remain visible while scrolling
 */
export function EditToolbar({
  title,
  subtitle,
  onSave,
  onPublish,
  onPreview,
  onDiscard,
  isSaving = false,
  isPublishing = false,
  hasFields = true,
}: EditToolbarProps) {
  return (
    <Box
      sx={{ ...layoutStyles.glassToolbar, top: { xs: 56, sm: 64 } }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 1.5,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            fontSize="1.125rem"
            letterSpacing="-0.02em"
            noWrap
            sx={{ color: '#f1f5f9' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
              noWrap
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {onPreview && (
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon fontSize="small" />}
              onClick={onPreview}
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
              Preview
            </Button>
          )}
          {onDiscard && (
            <Button
              variant="outlined"
              startIcon={<ReplayIcon fontSize="small" />}
              onClick={onDiscard}
              sx={{
                borderRadius: 999,
                px: 2.5,
                fontWeight: 600,
                fontSize: '0.875rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f1f5f9',
                background: 'rgba(255, 255, 255, 0.02)',
                '&:hover': {
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  background: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              Discard
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#f1f5f9' }} /> : <SaveIcon />}
            onClick={onSave}
            disabled={isSaving || isPublishing}
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
              '&:disabled': {
                color: '#64748b',
                borderColor: 'rgba(255, 255, 255, 0.05)',
                background: 'rgba(255, 255, 255, 0.01)',
              },
            }}
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button
            variant="contained"
            startIcon={isPublishing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PublishIcon />}
            onClick={onPublish}
            disabled={isSaving || isPublishing || !hasFields}
            sx={{
              ...buttonStyles.success,
              borderRadius: 999,
              px: 3,
              fontSize: '0.875rem',
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#64748b',
                boxShadow: 'none',
              },
            }}
          >
            {isPublishing ? 'Publishing…' : 'Publish'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

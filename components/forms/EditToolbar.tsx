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
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap>
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
              sx={{ borderRadius: 999, px: 2.5 }}
            >
              Preview
            </Button>
          )}
          {onDiscard && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ReplayIcon fontSize="small" />}
              onClick={onDiscard}
              sx={{ borderRadius: 999, px: 2.5 }}
            >
              Discard
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={onSave}
            disabled={isSaving || isPublishing}
            sx={{ borderRadius: 999, px: 2.5 }}
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button
            variant="contained"
            startIcon={isPublishing ? <CircularProgress size={16} color="inherit" /> : <PublishIcon />}
            onClick={onPublish}
            disabled={isSaving || isPublishing || !hasFields}
            sx={{ borderRadius: 999, px: 3 }}
          >
            {isPublishing ? 'Publishing…' : 'Publish'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

'use client'

import { useState } from 'react'
import { IconButton, Dialog, DialogContent, DialogTitle, Typography, Box, Chip, Button, Stack, ClickAwayListener } from '@mui/material'
import { Share as ShareIcon, ContentCopy, OpenInNew, Close } from '@mui/icons-material'
import { iconStyles, buttonStyles } from '@/theme'

export interface ShareIconButtonProps {
  slug: string | null
  shareUrl: string | null
  formStatus: 'draft' | 'published'
  onCopyClick?: () => void
}

/**
 * Share Icon Button Component
 * Shows a share icon button for published forms that opens a popup with the full share link
 *
 * @example
 * <ShareIconButton
 *   slug="customer-feedback-1lk4x9m"
 *   shareUrl="https://example.com/forms/share/customer-feedback-1lk4x9m"
 *   formStatus="published"
 * />
 */
export function ShareIconButton({ slug, shareUrl, formStatus, onCopyClick }: ShareIconButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Don't render anything for draft forms
  if (formStatus !== 'published' || !slug || !shareUrl) {
    return null
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        onCopyClick?.()
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
    handleClose()
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="Share form"
        size="small"
        sx={{ ml: 1, ...iconStyles.primary }}
      >
        <ShareIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'rgba(26, 26, 36, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
              Share this form
            </Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                ml: 1,
                color: '#94a3b8',
                '&:hover': {
                  color: '#f1f5f9',
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: 'rgba(19, 19, 26, 0.8)',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              border: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
            }}
          >
            {shareUrl}
          </Box>

          {copied && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Copied!"
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                }}
              />
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleCopy}
              variant="outlined"
              size="small"
              startIcon={<ContentCopy />}
              fullWidth
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f1f5f9',
                background: 'rgba(255, 255, 255, 0.02)',
                fontWeight: 600,
                '&:hover': {
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              Copy
            </Button>
            <Button
              onClick={handleOpenLink}
              variant="contained"
              size="small"
              startIcon={<OpenInNew />}
              fullWidth
              sx={buttonStyles.primary}
            >
              Open
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

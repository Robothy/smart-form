'use client'

import { useState } from 'react'
import { IconButton, Dialog, DialogContent, DialogTitle, Typography, Box, Chip, Button, Stack, ClickAwayListener } from '@mui/material'
import { Share as ShareIcon, ContentCopy, OpenInNew, Close } from '@mui/icons-material'

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
        sx={{ ml: 1 }}
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
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Share this form
            </Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ ml: 1 }}
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
              bgcolor: 'action.hover',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              border: 1,
              borderColor: 'divider',
            }}
          >
            {shareUrl}
          </Box>

          {copied && (
            <Box sx={{ mb: 2 }}>
              <Chip label="Copied!" color="success" size="small" />
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleCopy}
              variant="outlined"
              size="small"
              startIcon={<ContentCopy />}
              fullWidth
            >
              Copy
            </Button>
            <Button
              onClick={handleOpenLink}
              variant="contained"
              size="small"
              startIcon={<OpenInNew />}
              fullWidth
            >
              Open
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

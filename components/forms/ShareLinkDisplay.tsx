'use client'

import { useState } from 'react'
import { Box, TextField, Button, Typography, Alert, Chip, Stack } from '@mui/material'
import { ContentCopy as CopyIcon } from '@mui/icons-material'

export interface ShareLinkDisplayProps {
  slug: string | null
  shareUrl: string | null
  formStatus: 'draft' | 'published'
}

/**
 * Share Link Display Component
 * Shows the shareable link at the top of published form detail pages
 * Includes copy button and confirmation message
 *
 * @example
 * <ShareLinkDisplay
 *   slug="customer-feedback-1lk4x9m"
 *   shareUrl="https://example.com/forms/share/customer-feedback-1lk4x9m"
 *   formStatus="published"
 * />
 */
export function ShareLinkDisplay({ slug, shareUrl, formStatus }: ShareLinkDisplayProps) {
  const [copied, setCopied] = useState(false)

  // Construct share URL from slug if not provided
  const effectiveShareUrl = shareUrl || (slug ? `${window.location.origin}/forms/share/${slug}` : null)

  const handleCopy = async () => {
    if (effectiveShareUrl) {
      try {
        await navigator.clipboard.writeText(effectiveShareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  // Don't render anything for draft forms
  if (formStatus !== 'published' || !slug || !effectiveShareUrl) {
    return null
  }

  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'action.hover',
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Shareable Link</Typography>
            <Chip
              label="Published"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            value={effectiveShareUrl}
            InputProps={{
              readOnly: true,
              sx: {
                backgroundColor: 'background.paper',
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              },
            }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleCopy}
            startIcon={<CopyIcon />}
            sx={{ minWidth: 100 }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>

        {copied && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Link copied to clipboard!
          </Alert>
        )}
      </Stack>
    </Box>
  )
}

/**
 * Published Badge Component
 * Shows a "Published" badge with read-only styling
 */
export function PublishedBadge() {
  return (
    <Chip
      label="Published"
      color="success"
      size="small"
      sx={{
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    />
  )
}

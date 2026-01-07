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
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        background: 'rgba(26, 26, 36, 0.6)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
              Shareable Link
            </Typography>
            <Chip
              label="Published"
              size="small"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                height: 22,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                backdropFilter: 'blur(4px)',
              }}
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
                backgroundColor: 'rgba(19, 19, 26, 0.8)',
                color: '#94a3b8',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                '& .MuiInputBase-input': {
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
              },
            }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleCopy}
            startIcon={<CopyIcon />}
            sx={{
              minWidth: 100,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              },
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>

        {copied && (
          <Alert
            severity="success"
            sx={{
              mt: 1,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 2,
              color: '#10b981',
            }}
          >
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

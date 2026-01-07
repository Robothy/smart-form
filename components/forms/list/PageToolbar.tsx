'use client'

import { Box, Typography, Stack } from '@mui/material'

export interface PageToolbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

/**
 * Shared page toolbar component with fixed positioning
 * Used across forms list, view, submissions, and other pages
 *
 * @example
 * <PageToolbar
 *   title="My Forms"
 *   subtitle="5 forms total"
 *   actions={<Button>Save</Button>}
 * />
 */
export function PageToolbar({ title, subtitle, actions }: PageToolbarProps) {
  return (
    <Box
      sx={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'fixed',
        top: { xs: 56, sm: 64 },
        left: 0,
        right: 0,
        zIndex: 1030,
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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

        {actions && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {actions}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

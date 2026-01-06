'use client'

import { Chip } from '@mui/material'
import type { FormStatus } from '@/lib/validation/schemas'

export interface FormStatusBadgeProps {
  status: FormStatus
}

export function FormStatusBadge({ status }: FormStatusBadgeProps) {
  const isPublished = status === 'published'
  const label = isPublished ? 'Published' : 'Draft'

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        height: 22,
        background: isPublished
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
        border: `1px solid ${isPublished ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        color: isPublished ? '#10b981' : '#f59e0b',
        backdropFilter: 'blur(4px)',
      }}
    />
  )
}

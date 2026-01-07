'use client'

import { Chip } from '@mui/material'
import type { FormStatus } from '@/lib/validation/schemas'
import { badgeStyles } from '@/theme'

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
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        height: 22,
        backdropFilter: 'blur(4px)',
        ...(isPublished ? badgeStyles.published : badgeStyles.draft),
      }}
    />
  )
}

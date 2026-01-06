'use client'

import { Chip } from '@mui/material'
import type { FormStatus } from '@/lib/validation/schemas'

export interface FormStatusBadgeProps {
  status: FormStatus
}

export function FormStatusBadge({ status }: FormStatusBadgeProps) {
  const color = status === 'published' ? 'success' : 'warning'
  const label = status === 'published' ? 'Published' : 'Draft'

  return <Chip label={label} color={color} size="small" variant="filled" />
}

'use client'

import {
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  SxProps,
  Theme,
} from '@mui/material'
import { ReactNode } from 'react'
import { formStyles } from '@/theme'

export interface FieldGroupProps {
  label?: string
  required?: boolean
  error?: string
  children: ReactNode
  sx?: SxProps<Theme>
}

/**
 * FieldGroup wrapper component
 * Provides consistent field layout with label, required indicator, and error display
 */
export function FieldGroup({ label, required, error, children, sx }: FieldGroupProps) {
  return (
    <FormControl
      sx={{
        mb: 2.5,
        width: '100%',
        ...sx,
        '& .MuiFormLabel-root': {
          color: '#94a3b8',
          fontWeight: 500,
          fontSize: '0.875rem',
          '&.Mui-required': {
            color: '#94a3b8',
          },
        },
        '& .MuiFormHelperText-root': {
          color: '#ef4444',
          fontSize: '0.8125rem',
        },
      }}
      error={!!error}
    >
      {label && (
        <FormLabel
          component="legend"
          required={required}
          sx={{
            color: '#94a3b8',
            fontWeight: 500,
            fontSize: '0.875rem',
            mb: 1,
          }}
        >
          {label}
        </FormLabel>
      )}
      <Box>{children}</Box>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  )
}

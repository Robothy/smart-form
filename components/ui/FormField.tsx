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

export interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  children: ReactNode
  sx?: SxProps<Theme>
}

/**
 * FormField wrapper component
 * Provides consistent field layout with label, required indicator, and error display
 */
export function FormField({ label, required, error, children, sx }: FormFieldProps) {
  return (
    <FormControl sx={{ mb: 2, width: '100%', ...sx }} error={!!error}>
      {label && (
        <FormLabel component="legend" required={required}>
          {label}
        </FormLabel>
      )}
      <Box>{children}</Box>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  )
}

'use client'

import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material'
import { forwardRef } from 'react'

export interface FormInputProps extends Omit<MuiTextFieldProps, 'variant'> {
  label: string
  error?: string
}

/**
 * MUI TextField wrapper component for single-line text input
 * Adds consistent error display and styling with accessibility support
 */
export const FormInput = forwardRef<HTMLDivElement, FormInputProps>(
  ({ error, helperText, label, ...props }, ref) => {
    return (
      <MuiTextField
        ref={ref}
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error || helperText}
        label={label}
        aria-label={props.placeholder || label}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id || 'field'}-error` : helperText ? `${props.id || 'field'}-helper` : undefined}
        {...props}
      />
    )
  }
)

FormInput.displayName = 'FormInput'

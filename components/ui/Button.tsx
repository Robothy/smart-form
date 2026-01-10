import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material'
import { forwardRef } from 'react'

export type ButtonProps = MuiButtonProps

/**
 * MUI Button wrapper component
 * Wraps Material UI Button with project-specific defaults
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <MuiButton ref={ref} {...props} />
  }
)

Button.displayName = 'Button'

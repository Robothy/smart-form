'use client'

import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material'
import { forwardRef } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { formStyles } from '@/theme'

export interface FormInputProps extends Omit<MuiTextFieldProps, 'variant' | 'error'> {
  label?: string
  error?: string
}

/**
 * MUI TextField wrapper component for single-line text input
 * Adds consistent error display and styling with accessibility support
 */
export const FormInput = forwardRef<HTMLDivElement, FormInputProps>(
  ({ error, helperText, label, type, value, onChange, ...props }, ref) => {
    // For date inputs, use MUI X DatePicker
    if (type === 'date') {
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            enableAccessibleFieldDOMStructure={false}
            closeOnSelect
            slots={{
              textField: (params) => (
                <MuiTextField
                  {...params}
                  fullWidth
                  error={!!error}
                  helperText={error || helperText}
                  label={label}
                  InputLabelProps={{
                    sx: {
                      color: '#94a3b8',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      backgroundColor: 'rgba(19, 19, 26, 0.8)',
                      '& input': {
                        color: '#f1f5f9',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#94a3b8',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#6366f1',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#f1f5f9',
                      cursor: 'pointer',
                    },
                    ...props.sx,
                  }}
                />
              ),
            }}
            value={value instanceof Date ? value : null}
            onChange={(newValue) => {
              if (onChange) {
                // Create a synthetic event-like structure
                onChange({
                  target: { value: newValue },
                } as unknown as React.ChangeEvent<HTMLInputElement>)
              }
            }}
            slotProps={{
              desktopPaper: {
                sx: {
                  transition: 'none !important',
                },
              },
              actionBar: {
                actions: ['clear', 'today'],
              },
              popper: {
                disablePortal: false,
                sx: {
                  '&.MuiPopper-root': {
                    visibility: 'visible !important',
                  },
                  '& .MuiPickersPopper-paper': {
                    background: 'rgba(26, 26, 36, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  },
                  '& .MuiDayCalendar-header': {
                    color: '#f1f5f9 !important',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    color: '#94a3b8 !important',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  },
                  '& .MuiPickersDay-day': {
                    color: '#f1f5f9 !important',
                    fontSize: '0.875rem',
                  },
                  '& .MuiPickersDay-dayOutsideMonth': {
                    color: '#64748b !important',
                  },
                  '& .MuiPickersDay-today': {
                    borderColor: '#6366f1 !important',
                  },
                  '& .MuiPickersDay-root.Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important',
                    color: '#ffffff !important',
                    fontWeight: 600,
                  },
                  '& .MuiPickersDay-root:hover': {
                    background: 'rgba(99, 102, 241, 0.15) !important',
                  },
                  '& .MuiPickersDay-root.Mui-selected:hover': {
                    background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%) !important',
                  },
                  '& .MuiMonthCalendar-root .MuiPickersDay-monthButton': {
                    color: '#f1f5f9 !important',
                    fontSize: '0.875rem',
                  },
                  '& .MuiMonthCalendar-root .MuiPickersDay-monthButton:hover': {
                    background: 'rgba(99, 102, 241, 0.15) !important',
                  },
                  '& .MuiYearCalendar-root .MuiPickersYear-yearButton': {
                    color: '#f1f5f9 !important',
                    fontSize: '0.875rem',
                  },
                  '& .MuiYearCalendar-root .MuiPickersYear-yearButton:hover': {
                    background: 'rgba(99, 102, 241, 0.15) !important',
                  },
                  '& .MuiPickersArrowSwitcher-button': {
                    color: '#94a3b8 !important',
                  },
                  '& .MuiPickersArrowSwitcher-button:hover': {
                    background: 'rgba(99, 102, 241, 0.1) !important',
                  },
                  '& .MuiDialogActions-root .MuiButton-text': {
                    color: '#6366f1 !important',
                    fontWeight: 600,
                  },
                  '& .MuiDialogActions-root .MuiButton-text:hover': {
                    background: 'rgba(99, 102, 241, 0.1) !important',
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
      )
    }

    return (
      <MuiTextField
        ref={ref}
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error || helperText}
        label={label}
        type={type}
        value={value}
        onChange={onChange}
        aria-label={props.placeholder || label}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id || 'field'}-error` : helperText ? `${props.id || 'field'}-helper` : undefined}
        sx={{
          ...formStyles.input,
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.15)',
          },
        }}
        {...props}
      />
    )
  }
)

FormInput.displayName = 'FormInput'

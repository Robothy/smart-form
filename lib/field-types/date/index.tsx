import { TextField } from '@mui/material'
import type { FieldTypeConfig, FormFieldData, FieldFillProps, FieldViewProps } from '../types'

/**
 * Date field type configuration
 * Date picker with ISO format string storage
 */
export const dateFieldType: FieldTypeConfig = {
  type: 'date',

  defaultProps: {
    type: 'date',
    required: false,
  },

  // Fill mode - user input
  FillComponent: ({ field, value, onChange, error, disabled }: FieldFillProps) => (
    <TextField
      type="date"
      fullWidth
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
      id={field.id!}
      aria-labelledby={`${field.id!}-label`}
      aria-required={field.required}
      disabled={disabled}
      InputLabelProps={{
        shrink: true,
        sx: {
          color: '#94a3b8',
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          background: 'rgba(19, 19, 26, 0.8)',
          '& input': {
            color: '#f1f5f9',
          },
          '& fieldset': {
            borderColor: error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover fieldset': {
            borderColor: error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.15)',
          },
          '&.Mui-focused fieldset': {
            borderColor: error ? '#ef4444' : '#6366f1',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#94a3b8',
        },
        '& .MuiFormHelperText-root': {
          color: '#ef4444',
          ml: 0,
        },
        // Native date picker icon styling
        '& input[type="date"]::-webkit-calendar-picker-indicator': {
          filter: 'invert(1)',
          opacity: 0.6,
          cursor: disabled ? 'not-allowed' : 'pointer',
        },
        '& input[type="date"]::-webkit-calendar-picker-indicator:hover': {
          opacity: 1,
        },
      }}
    />
  ),

  // View mode - display submitted value
  ViewComponent: ({ field, value }: FieldViewProps) => (
    <div
      style={{
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        color: '#f1f5f9',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {value ? new Date(value as string).toLocaleDateString() : <span style={{ color: '#64748b' }}>No value</span>}
    </div>
  ),

  // Server-side validation
  validateValue: (field: FormFieldData, value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return { valid: !field.required, error: field.required ? `${field.label} is required` : undefined }
    }
    if (typeof value !== 'string') {
      return { valid: false, error: `${field.label} must be a string` }
    }
    // Check if it's a valid ISO date string
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return { valid: false, error: `${field.label} must be a valid date` }
    }
    return { valid: true }
  },
}

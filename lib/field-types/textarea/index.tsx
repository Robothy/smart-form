import { TextField } from '@mui/material'
import type { FieldTypeConfig, FormFieldData, FieldFillProps, FieldViewProps } from '../types'

/**
 * Textarea field type configuration
 * Multi-line text input with optional placeholder
 */
export const textareaFieldType: FieldTypeConfig = {
  type: 'textarea',

  defaultProps: {
    type: 'textarea',
    required: false,
  },

  // Fill mode - user input
  FillComponent: ({ field, value, onChange, error, disabled }: FieldFillProps) => (
    <TextField
      fullWidth
      multiline
      rows={4}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      error={!!error}
      helperText={error}
      id={field.id!}
      aria-labelledby={`${field.id!}-label`}
      aria-required={field.required}
      disabled={disabled}
      sx={{
        '& .MuiOutlinedInput-root': {
          background: 'rgba(19, 19, 26, 0.8)',
          '& textarea': {
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
        minHeight: '80px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {value || <span style={{ color: '#64748b' }}>No value</span>}
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
    if (value.length > 10000) {
      return { valid: false, error: `${field.label} must be 10000 characters or less` }
    }
    return { valid: true }
  },
}

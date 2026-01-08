'use client'

import { Box, Typography } from '@mui/material'
import { FormInput } from '@/components/ui/FormInput'

export interface FormFieldData {
  id?: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'radio' | 'checkbox'
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  order?: number
}

export interface FormFieldRendererProps {
  field: FormFieldData
  value: string | string[]
  error?: string
  onChange: (fieldId: string, value: string | string[]) => void
}

export function FormFieldRenderer({ field, value, error, onChange }: FormFieldRendererProps) {
  const fieldId = field.id!

  const handleValueChange = (newValue: string | string[]) => {
    onChange(fieldId, newValue)
  }

  return (
    <Box key={fieldId || field.order}>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ fontWeight: 500, color: '#f1f5f9' }}
        id={`${fieldId}-label`}
      >
        {field.label}
        {field.required && <span style={{ color: '#10b981' }}> *</span>}
      </Typography>

      {field.type === 'text' && (
        <FormInput
          value={value as string || ''}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={field.placeholder}
          error={error}
          id={fieldId}
          aria-labelledby={`${fieldId}-label`}
          aria-required={field.required}
        />
      )}

      {field.type === 'textarea' && (
        <FormInput
          multiline
          rows={4}
          value={value as string || ''}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={field.placeholder}
          error={error}
          id={fieldId}
          aria-labelledby={`${fieldId}-label`}
          aria-required={field.required}
        />
      )}

      {field.type === 'date' && (
        <FormInput
          type="date"
          value={value as string || ''}
          onChange={(e) => handleValueChange(e.target.value)}
          error={error}
          id={fieldId}
          aria-labelledby={`${fieldId}-label`}
          aria-required={field.required}
        />
      )}

      {field.type === 'radio' && (
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          role="radiogroup"
          aria-labelledby={`${fieldId}-label`}
          aria-required={field.required}
          aria-invalid={!!error}
        >
          {field.options?.map((option) => (
            <label
              key={option.value}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#f1f5f9' }}
            >
              <input
                type="radio"
                name={fieldId}
                id={`${fieldId}-${option.value}`}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => handleValueChange(e.target.value)}
                aria-label={option.label}
                style={{
                  accentColor: '#6366f1',
                  width: 18,
                  height: 18,
                  cursor: 'pointer',
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
          {error && (
            <Typography variant="caption" role="alert" id={`${fieldId}-error`} sx={{ color: '#ef4444' }}>
              {error}
            </Typography>
          )}
        </Box>
      )}

      {field.type === 'checkbox' && (
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          role="group"
          aria-labelledby={`${fieldId}-label`}
          aria-required={field.required}
          aria-invalid={!!error}
        >
          {field.options?.map((option) => (
            <label
              key={option.value}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#f1f5f9' }}
            >
              <input
                type="checkbox"
                name={fieldId}
                id={`${fieldId}-${option.value}`}
                value={option.value}
                checked={Array.isArray(value) && value.includes(option.value)}
                onChange={(e) => {
                  const currentValues = (value as string[]) || []
                  if (e.target.checked) {
                    handleValueChange([...currentValues, option.value])
                  } else {
                    handleValueChange(currentValues.filter((v: string) => v !== option.value))
                  }
                }}
                aria-label={option.label}
                style={{
                  accentColor: '#6366f1',
                  width: 18,
                  height: 18,
                  cursor: 'pointer',
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
          {error && (
            <Typography variant="caption" role="alert" id={`${fieldId}-error`} sx={{ color: '#ef4444' }}>
              {error}
            </Typography>
          )}
        </Box>
      )}

      {error && field.type !== 'radio' && field.type !== 'checkbox' && (
        <Typography variant="caption" role="alert" id={`${fieldId}-error`} sx={{ mt: 0.5, color: '#ef4444' }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

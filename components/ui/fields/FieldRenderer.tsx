'use client'

import { Typography } from '@mui/material'
import { getFieldType } from '@/lib/field-types'
import type { FormFieldData, FieldValue } from '@/lib/field-types'

export interface FieldRendererProps {
  field: FormFieldData
  value: FieldValue
  onChange: (value: FieldValue) => void
  error?: string
  disabled?: boolean
}

/**
 * Generic field renderer for fill mode
 *
 * Delegates rendering to the field type's FillComponent
 * based on the field's type configuration.
 */
export function FieldRenderer({ field, value, onChange, error, disabled }: FieldRendererProps) {
  const fieldType = getFieldType(field.type)

  if (!fieldType) {
    return (
      <Typography color="error">
        Unknown field type: {field.type}
      </Typography>
    )
  }

  const FillComponent = fieldType.FillComponent

  return (
    <>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ fontWeight: 500, color: '#f1f5f9' }}
        id={`${field.id!}-label`}
      >
        {field.label}
        {field.required && <span style={{ color: '#10b981' }}> *</span>}
      </Typography>

      <FillComponent
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
      />

      {error && field.type !== 'radio' && field.type !== 'checkbox' && (
        <Typography variant="caption" role="alert" id={`${field.id!}-error`} sx={{ mt: 0.5, color: '#ef4444' }}>
          {error}
        </Typography>
      )}
    </>
  )
}

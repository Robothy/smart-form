'use client'

import { TextField, MenuItem, Box, FormControlLabel, Switch, Typography } from '@mui/material'
import { FormField } from '@/components/ui/FormField'
import { getFieldType, getFieldTypes } from '@/lib/field-types'
import type { FormFieldData, FormFieldType } from '@/lib/field-types'

export interface FieldEditorProps {
  field: FormFieldData
  onChange: (updates: Partial<FormFieldData>) => void
  readonly?: boolean
}

/**
 * Generic field editor for edit mode
 *
 * Provides:
 * - Field label input
 * - Field type selector
 * - Placeholder input (for applicable types)
 * - Required toggle
 * - Type-specific properties (via EditComponent)
 */
export function FieldEditor({ field, onChange, readonly }: FieldEditorProps) {
  const fieldType = getFieldType(field.type)
  const availableTypes = getFieldTypes()

  const handleTypeChange = (newType: FormFieldType) => {
    // Reset type-specific properties when changing type
    const newFieldType = getFieldType(newType)
    if (newFieldType) {
      onChange({
        type: newType,
        // Keep label, required, order
        label: field.label,
        required: field.required,
        order: field.order,
        // Reset type-specific props to defaults
        placeholder: newFieldType.defaultProps.placeholder,
        options: newFieldType.defaultProps.options,
      })
    }
  }

  const showPlaceholder = ['text', 'textarea', 'date'].includes(field.type)

  return (
    <>
      {/* Field Label */}
      <FormField label="Field Label" required>
        <TextField
          fullWidth
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          disabled={readonly}
          placeholder="Field label"
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(19, 19, 26, 0.8)',
              '& input': {
                color: '#f1f5f9',
              },
            },
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
        />
      </FormField>

      {/* Field Type Selector */}
      <FormField label="Field Type">
        <TextField
          fullWidth
          select
          value={field.type}
          onChange={(e) => {
            const newType = e.target.value as FormFieldType
            handleTypeChange(newType)
          }}
          disabled={readonly}
          SelectProps={{
            MenuProps: {
              disableScrollLock: true,
              PaperProps: {
                sx: {
                  background: 'rgba(26, 26, 36, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '0.75rem',
                  mt: 1,
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                },
              },
              sx: {
                '& .MuiMenu-list': {
                  py: 0.5,
                  padding: '0.5rem',
                },
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(19, 19, 26, 0.8)',
              color: '#f1f5f9',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
              },
            },
            '& .MuiSelect-icon': {
              color: '#94a3b8',
            },
          }}
        >
          {availableTypes.map((type) => (
            <MenuItem
              key={type}
              value={type}
              sx={{
                color: '#f1f5f9',
                borderRadius: '0.375rem',
                my: 0.25,
                mx: 0.5,
                py: 0.75,
                px: 1,
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.15)',
                },
                '&.Mui-selected': {
                  background: 'rgba(99, 102, 241, 0.25)',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.3)',
                  },
                },
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      </FormField>

      {/* Placeholder (for text/textarea/date) */}
      {showPlaceholder && (
        <FormField label="Placeholder">
          <TextField
            fullWidth
            value={field.placeholder || ''}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            disabled={readonly}
            placeholder="Placeholder text"
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(19, 19, 26, 0.8)',
                '& input': {
                  color: '#f1f5f9',
                },
              },
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
          />
        </FormField>
      )}

      {/* Required Toggle */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={field.required}
              onChange={() => onChange({ required: !field.required })}
              disabled={readonly}
              sx={{
                '& .MuiSwitch-switchBase': {
                  '&.Mui-checked': {
                    color: '#6366f1',
                    '& + .MuiSwitch-track': {
                      backgroundColor: 'rgba(99, 102, 241, 0.6)',
                      opacity: 1,
                    },
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  opacity: 1,
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                },
                '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                  opacity: 0.5,
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                color: field.required ? '#10b981' : '#94a3b8',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {field.required ? 'Required' : 'Optional'}
            </Typography>
          }
        />
      </Box>

      {/* Type-Specific Properties */}
      {fieldType?.EditComponent && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.875rem', mb: 2 }}
          >
            Type-Specific Settings
          </Typography>
          <fieldType.EditComponent
            field={field}
            onChange={onChange}
            readonly={readonly}
          />
        </Box>
      )}
    </>
  )
}

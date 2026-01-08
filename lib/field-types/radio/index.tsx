import { useState } from 'react'
import { TextField, MenuItem, Box, IconButton } from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import type { FieldTypeConfig, FormFieldData, FieldEditProps, FieldFillProps, FieldViewProps } from '../types'
import type { FieldOption } from '../types'

/**
 * Radio field type configuration
 * Single-select from predefined options
 */
export const radioFieldType: FieldTypeConfig = {
  type: 'radio',

  defaultProps: {
    type: 'radio',
    required: false,
    options: [],
  },

  // Edit mode - configure the radio field
  EditComponent: ({ field, onChange, readonly }: FieldEditProps) => {
    const [newOptionLabel, setNewOptionLabel] = useState('')
    const [newOptionValue, setNewOptionValue] = useState('')

    const handleAddOption = () => {
      if (!newOptionLabel.trim() || !newOptionValue.trim()) return

      const newOption: FieldOption = {
        label: newOptionLabel.trim(),
        value: newOptionValue.trim(),
      }

      onChange({
        options: [...(field.options || []), newOption],
      })

      setNewOptionLabel('')
      setNewOptionValue('')
    }

    const handleRemoveOption = (index: number) => {
      onChange({
        options: field.options?.filter((_, i) => i !== index),
      })
    }

    const handleOptionLabelChange = (index: number, newLabel: string) => {
      const updated = field.options?.map((opt, i) =>
        i === index ? { ...opt, label: newLabel } : opt
      )
      onChange({ options: updated })
    }

    const handleOptionValueChange = (index: number, newValue: string) => {
      const updated = field.options?.map((opt, i) =>
        i === index ? { ...opt, value: newValue } : opt
      )
      onChange({ options: updated })
    }

    return (
      <>
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

        {/* Options Management */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.875rem', mb: 1 }}
          >
            Options
          </Typography>

          {/* Existing Options */}
          {(field.options || []).map((option, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                mb: 1,
              }}
            >
              <TextField
                size="small"
                value={option.label}
                onChange={(e) => handleOptionLabelChange(index, e.target.value)}
                disabled={readonly}
                placeholder="Label"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(19, 19, 26, 0.8)',
                    '& input': {
                      color: '#f1f5f9',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
              <TextField
                size="small"
                value={option.value}
                onChange={(e) => handleOptionValueChange(index, e.target.value)}
                disabled={readonly}
                placeholder="Value"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(19, 19, 26, 0.8)',
                    '& input': {
                      color: '#f1f5f9',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
              {!readonly && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveOption(index)}
                  sx={{
                    color: '#94a3b8',
                    '&:hover': {
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          {/* Add New Option */}
          {!readonly && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
              <TextField
                size="small"
                value={newOptionLabel}
                onChange={(e) => setNewOptionLabel(e.target.value)}
                placeholder="New option label"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(19, 19, 26, 0.8)',
                    '& input': {
                      color: '#f1f5f9',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
              <TextField
                size="small"
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                placeholder="Value"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(19, 19, 26, 0.8)',
                    '& input': {
                      color: '#f1f5f9',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={handleAddOption}
                disabled={!newOptionLabel.trim() || !newOptionValue.trim()}
                sx={{
                  color: '#6366f1',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.1)',
                  },
                  '&:disabled': {
                    color: '#64748b',
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {!field.options || field.options.length === 0 ? (
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontSize: '0.8125rem', mt: 1, display: 'block' }}
            >
              Add at least one option
            </Typography>
          ) : null}
        </Box>
      </>
    )
  },

  // Fill mode - user input
  FillComponent: ({ field, value, onChange, error, disabled }: FieldFillProps) => (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      role="radiogroup"
      aria-labelledby={`${field.id!}-label`}
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
            name={field.id}
            id={`${field.id!}-${option.value}`}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={option.label}
            disabled={disabled}
            style={{
              accentColor: '#6366f1',
              width: 18,
              height: 18,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
          <span style={{ opacity: disabled ? 0.5 : 1 }}>{option.label}</span>
        </label>
      ))}
    </Box>
  ),

  // View mode - display submitted value
  ViewComponent: ({ field, value }: FieldViewProps) => {
    const selectedOption = field.options?.find((opt) => opt.value === value)
    return (
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
        {selectedOption?.label || <span style={{ color: '#64748b' }}>No value</span>}
      </div>
    )
  },

  // Server-side validation
  validateValue: (field: FormFieldData, value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return { valid: !field.required, error: field.required ? `${field.label} is required` : undefined }
    }
    if (typeof value !== 'string') {
      return { valid: false, error: `${field.label} must be a string` }
    }
    // Check if value matches one of the options
    const isValidOption = field.options?.some((opt) => opt.value === value)
    if (!isValidOption) {
      return { valid: false, error: `${field.label} must match one of the provided options` }
    }
    return { valid: true }
  },
}

import { Typography } from '@mui/material'

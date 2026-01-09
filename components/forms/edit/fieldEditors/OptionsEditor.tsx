'use client'

import { Box, Button, Stack, TextField, IconButton, Typography } from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import type { FieldEditorProps } from './FieldEditorProps'

/**
 * OptionsEditor - Editor for radio/checkbox field options
 * Allows adding, removing, and editing {label, value} pairs
 */
export function OptionsEditor({ field, onChange, readonly }: FieldEditorProps) {
  const options = field.options || []

  const addOption = () => {
    const newOption = { label: `Option ${options.length + 1}`, value: `option-${options.length + 1}` }
    onChange({ options: [...options, newOption] })
  }

  const updateOption = (index: number, updates: Partial<{ label: string; value: string }>) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], ...updates }
    onChange({ options: newOptions })
  }

  const handleLabelChange = (index: number, newLabel: string) => {
    // Auto-generate value from label if value is empty or equals the old label
    const option = options[index]
    const shouldUpdateValue = !option.value || option.value === option.label

    updateOption(index, {
      label: newLabel,
      ...(shouldUpdateValue ? { value: newLabel.toLowerCase().replace(/\s+/g, '-') } : {}),
    })
  }

  const removeOption = (index: number) => {
    if (options.length <= 1) return // Require at least 1 option
    onChange({ options: options.filter((_, i) => i !== index) })
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, color: '#94a3b8', fontWeight: 500, fontSize: '0.875rem' }}>
        Options
      </Typography>
      <Stack spacing={2}>
        {options.map((option, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Label"
              value={option.label}
              onChange={(e) => handleLabelChange(index, e.target.value)}
              disabled={readonly}
              fullWidth
              sx={{
                flex: 1,
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
            <TextField
              label="Value"
              value={option.value}
              onChange={(e) => updateOption(index, { value: e.target.value })}
              disabled={readonly}
              fullWidth
              sx={{
                flex: 1,
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
            {!readonly && options.length > 1 && (
              <IconButton
                onClick={() => removeOption(index)}
                size="small"
                sx={{
                  color: '#94a3b8',
                  transition: 'all 0.2s',
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
        {!readonly && (
          <Button
            startIcon={<AddIcon />}
            onClick={addOption}
            variant="outlined"
            sx={{
              mt: 1,
              fontWeight: 600,
              fontSize: '0.875rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#6366f1',
              background: 'rgba(99, 102, 241, 0.05)',
              '&:hover': {
                border: '1px solid rgba(99, 102, 241, 0.5)',
                background: 'rgba(99, 102, 241, 0.15)',
              },
            }}
          >
            Add Option
          </Button>
        )}
      </Stack>
    </Box>
  )
}

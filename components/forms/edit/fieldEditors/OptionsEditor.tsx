'use client'

import { useState } from 'react'
import { Box, Button, Stack, TextField, IconButton, Typography } from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'
import type { FieldEditorProps } from './FieldEditorProps'

/**
 * OptionsEditor - Editor for radio/checkbox field options
 * Allows adding, removing, and editing {label, value} pairs
 * Value field is optional - auto-generates from label when collapsed
 */
export function OptionsEditor({ field, onChange, readonly }: FieldEditorProps) {
  const options = field.options || []
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedOptions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedOptions(newExpanded)
  }

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
    const isExpanded = expandedOptions.has(index)
    const option = options[index]

    // Auto-generate value from label if collapsed OR value is empty
    if (!isExpanded || !option.value) {
      updateOption(index, {
        label: newLabel,
        value: newLabel.toLowerCase().replace(/\s+/g, '-'),
      })
    } else {
      updateOption(index, { label: newLabel })
    }
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
          <Box key={index}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
              <IconButton
                onClick={() => toggleExpanded(index)}
                size="small"
                disabled={readonly}
                sx={{
                  color: '#94a3b8',
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: '#6366f1',
                    background: 'rgba(99, 102, 241, 0.1)',
                  },
                }}
                title={expandedOptions.has(index) ? 'Hide value' : 'Show value'}
              >
                {expandedOptions.has(index) ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
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
            {expandedOptions.has(index) && (
              <TextField
                label="Value"
                value={option.value}
                onChange={(e) => updateOption(index, { value: e.target.value })}
                disabled={readonly}
                fullWidth
                sx={{
                  mt: 1,
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

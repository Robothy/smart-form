'use client'

import { FieldGroup } from '@/components/ui/FieldGroup'
import { TextField, FormControlLabel, Switch, Typography, Box } from '@mui/material'
import type { FieldEditorProps } from './FieldEditorProps'

/**
 * CommonFieldEditor - Shared editor for all field types
 * Renders the label (required) and required toggle
 */
export function CommonFieldEditor({ field, onChange, readonly }: FieldEditorProps) {
  return (
    <>
      <FieldGroup label="Field Label" required>
        <TextField
          fullWidth
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          disabled={readonly}
          placeholder="Field label"
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
      </FieldGroup>

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
    </>
  )
}

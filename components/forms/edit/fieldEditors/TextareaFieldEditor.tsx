'use client'

import { FieldGroup } from '@/components/ui/FieldGroup'
import { TextField } from '@mui/material'
import { CommonFieldEditor } from './CommonFieldEditor'
import type { FieldEditorProps } from './FieldEditorProps'

/**
 * TextareaFieldEditor - Editor for textarea fields
 * Includes common fields + placeholder
 */
export function TextareaFieldEditor(props: FieldEditorProps) {
  return (
    <>
      <CommonFieldEditor {...props} />
      <FieldGroup label="Placeholder">
        <TextField
          fullWidth
          value={props.field.placeholder || ''}
          onChange={(e) => props.onChange({ placeholder: e.target.value })}
          disabled={props.readonly}
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
      </FieldGroup>
    </>
  )
}

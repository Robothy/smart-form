'use client'

import { useState } from 'react'
import { Box, Button, Container, Paper, Typography, TextField, Stack, IconButton } from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { FormField } from '@/components/ui/FormField'
import { FormInput } from '@/components/ui/FormInput'

export type FormFieldType = 'text' | 'textarea' | 'date' | 'radio' | 'checkbox'

export interface FormFieldData {
  id?: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: { label: string; value: string }[]
  order: number
}

export interface FormData {
  id?: string
  title: string
  description?: string
  status: 'draft' | 'published'
  slug?: string | null
  fields: FormFieldData[]
}

export interface FormBuilderProps {
  form: FormData
  onSave: (form: Omit<FormData, 'id' | 'status'>) => void
  onUpdate?: (form: FormData) => void
  readonly?: boolean
}

export function FormBuilder({ form, onSave, onUpdate, readonly = false }: FormBuilderProps) {
  const [localForm, setLocalForm] = useState<FormData>(form)
  const [isSaving, setIsSaving] = useState(false)

  const handleFieldChange = (index: number, field: Partial<FormFieldData>) => {
    const updatedFields = [...localForm.fields]
    updatedFields[index] = { ...updatedFields[index], ...field }
    const updated = { ...localForm, fields: updatedFields }
    setLocalForm(updated)
    onUpdate?.(updated)
  }

  const addField = () => {
    const newField: FormFieldData = {
      type: 'text',
      label: '',
      required: false,
      order: localForm.fields.length,
    }
    const updated = { ...localForm, fields: [...localForm.fields, newField] }
    setLocalForm(updated)
    onUpdate?.(updated)
  }

  const removeField = (index: number) => {
    const updatedFields = localForm.fields.filter((_, i) => i !== index)
    const updated = { ...localForm, fields: updatedFields }
    setLocalForm(updated)
    onUpdate?.(updated)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        title: localForm.title,
        description: localForm.description,
        fields: localForm.fields,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {readonly ? 'View Form' : localForm.id ? 'Edit Form' : 'Create New Form'}
        </Typography>

        <Stack spacing={3}>
          {/* Form metadata */}
          <FormField label="Form Title" required>
            <TextField
              fullWidth
              value={localForm.title}
              onChange={(e) => {
                const updated = { ...localForm, title: e.target.value }
                setLocalForm(updated)
                onUpdate?.(updated)
              }}
              disabled={readonly}
              placeholder="Enter form title"
            />
          </FormField>

          <FormField label="Description">
            <TextField
              fullWidth
              multiline
              rows={3}
              value={localForm.description || ''}
              onChange={(e) => {
                const updated = { ...localForm, description: e.target.value }
                setLocalForm(updated)
                onUpdate?.(updated)
              }}
              disabled={readonly}
              placeholder="Enter form description (optional)"
            />
          </FormField>

          {/* Form fields */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Form Fields</Typography>
              {!readonly && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={addField}
                  variant="contained"
                >
                  Add Field
                </Button>
              )}
            </Box>

            <Stack spacing={2}>
              {localForm.fields.map((field, index) => (
                <Box
                  key={field.id || index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1">Field {index + 1}</Typography>
                    {!readonly && (
                      <IconButton
                        onClick={() => removeField(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Stack spacing={2}>
                    <FormField label="Field Label" required>
                      <TextField
                        fullWidth
                        value={field.label}
                        onChange={(e) => handleFieldChange(index, { label: e.target.value })}
                        disabled={readonly}
                        placeholder="Field label"
                      />
                    </FormField>

                    <FormField label="Field Type">
                      <TextField
                        fullWidth
                        select
                        value={field.type}
                        onChange={(e) => handleFieldChange(index, { type: e.target.value as FormFieldType })}
                        disabled={readonly}
                        SelectProps={{ native: true }}
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="date">Date</option>
                        <option value="radio">Radio</option>
                        <option value="checkbox">Checkbox</option>
                      </TextField>
                    </FormField>

                    <FormField label="Placeholder">
                      <TextField
                        fullWidth
                        value={field.placeholder || ''}
                        onChange={(e) => handleFieldChange(index, { placeholder: e.target.value })}
                        disabled={readonly}
                        placeholder="Placeholder text"
                      />
                    </FormField>

                    <Box>
                      <Button
                        variant={field.required ? 'contained' : 'outlined'}
                        onClick={() => handleFieldChange(index, { required: !field.required })}
                        disabled={readonly}
                      >
                        {field.required ? 'Required' : 'Optional'}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              ))}

              {localForm.fields.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography>No fields added yet. Click "Add Field" to get started.</Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Save button */}
          {!readonly && (
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={isSaving || !localForm.title.trim()}
              fullWidth
            >
              {isSaving ? 'Saving...' : localForm.id ? 'Save Changes' : 'Create Form'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

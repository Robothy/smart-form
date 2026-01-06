'use client'

import { useState, useRef, useEffect } from 'react'
import { Box, Button, Paper, Typography, TextField, Stack, IconButton } from '@mui/material'
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
  showSaveButton?: boolean
  showHeading?: boolean
}

export function FormBuilder({
  form,
  onSave,
  onUpdate,
  readonly = false,
  showSaveButton = true,
  showHeading = true,
}: FormBuilderProps) {
  const [localForm, setLocalForm] = useState<FormData>(form)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedFieldIndex, setExpandedFieldIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the form builder to collapse expanded field
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpandedFieldIndex(null)
      }
    }

    if (expandedFieldIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [expandedFieldIndex])

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
    setExpandedFieldIndex(localForm.fields.length)
  }

  const removeField = (index: number) => {
    const updatedFields = localForm.fields.filter((_, i) => i !== index)
    const updated = { ...localForm, fields: updatedFields }
    setLocalForm(updated)
    onUpdate?.(updated)
    if (expandedFieldIndex === index) {
      setExpandedFieldIndex(null)
    } else if (expandedFieldIndex !== null && expandedFieldIndex > index) {
      setExpandedFieldIndex(expandedFieldIndex - 1)
    }
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
    <Paper sx={{ p: 3 }} ref={containerRef}>
      {showHeading && (
        <Typography variant="h4" gutterBottom>
          {readonly ? 'View Form' : localForm.id ? 'Edit Form' : 'Create New Form'}
        </Typography>
      )}

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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Form Fields
          </Typography>

          <Stack spacing={2}>
            {localForm.fields.map((field, index) => {
              const isExpanded = expandedFieldIndex === index

              return (
                <Box
                  key={field.id || index}
                  onClick={() => !readonly && !isExpanded && setExpandedFieldIndex(index)}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: isExpanded ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    position: 'relative',
                    cursor: !readonly && !isExpanded ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': !readonly && !isExpanded ? {
                      borderColor: 'primary.light',
                      bgcolor: 'action.hover',
                    } : {},
                  }}
                >
                  {!readonly && !isExpanded && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <IconButton
                        onClick={() => removeField(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}

                  {/* View Mode - Collapsed */}
                  {!isExpanded && (
                    <Box sx={{ pr: 5 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {field.label || '(Untitled field)'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Type: {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="body2" color={field.required ? 'error.main' : 'text.secondary'}>
                          {field.required ? 'Required' : 'Optional'}
                        </Typography>
                        {field.placeholder && (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              Placeholder: {field.placeholder}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Edit Mode - Expanded */}
                  {isExpanded && (
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="primary">
                          Editing Field
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => setExpandedFieldIndex(null)}
                        >
                          Done
                        </Button>
                      </Box>

                      <FormField label="Field Label" required>
                        <TextField
                          fullWidth
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, { label: e.target.value })}
                          disabled={readonly}
                          placeholder="Field label"
                          autoFocus
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
                  )}
                </Box>
              )
            })}

            {localForm.fields.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>No fields added yet. Click "Add Field" to get started.</Typography>
              </Box>
            )}
          </Stack>

          {!readonly && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={addField}
                variant="outlined"
              >
                Add Field
              </Button>
            </Box>
          )}
        </Box>

        {/* Save button */}
        {!readonly && showSaveButton && (
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
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Box, Button, Paper, Typography, TextField, Stack, IconButton } from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { FormField } from '@/components/ui/FormField'
import { FieldEditor } from '@/components/ui/fields'
import type { FormFieldData, FormFieldType } from '@/lib/field-types'
import { layoutStyles, buttonStyles, flexStyles } from '@/theme'

export type { FormFieldData } from '@/lib/field-types'

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
      // Check if click originated from MUI Menu/Select dropdown
      const target = event.target as Element
      const isMenuClick =
        target.closest('.MuiMenu-root') ||
        target.closest('.MuiPopover-root') ||
        target.classList.contains('MuiMenuItem-root') ||
        target.classList.contains('MuiBackdrop-root')

      // Only collapse if clicking outside and not on a menu
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !isMenuClick
      ) {
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
    <Paper
      sx={{
        p: 3,
        ...layoutStyles.glassSurface,
        borderRadius: 2,
      }}
      ref={containerRef}
    >
      {showHeading && (
        <Typography variant="h4" gutterBottom sx={{ color: '#f1f5f9', fontWeight: 700 }}>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(19, 19, 26, 0.8)',
                '& textarea': {
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

        {/* Form fields */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: '#f1f5f9', fontWeight: 700 }}>
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
                    p: 2.5,
                    border: 1,
                    borderColor: isExpanded ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 2,
                    background: isExpanded
                      ? 'rgba(99, 102, 241, 0.05)'
                      : 'rgba(255, 255, 255, 0.02)',
                    position: 'relative',
                    cursor: !readonly && !isExpanded ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': !readonly && !isExpanded ? {
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      background: 'rgba(255, 255, 255, 0.04)',
                    } : {},
                  }}
                >
                  {!readonly && !isExpanded && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <IconButton
                        onClick={() => removeField(index)}
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
                    </Box>
                  )}

                  {/* View Mode - Collapsed */}
                  {!isExpanded && (
                    <Box sx={{ pr: 5 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        gutterBottom
                        sx={{ color: '#f1f5f9', fontSize: '1rem' }}
                      >
                        {field.label || '(Untitled field)'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                          Type: {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          •
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: field.required ? '#10b981' : '#94a3b8',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        >
                          {field.required ? 'Required' : 'Optional'}
                        </Typography>
                        {field.placeholder && (
                          <>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              •
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }} noWrap>
                              Placeholder: {field.placeholder}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Edit Mode - Expanded */}
                  {isExpanded && (
                    <Stack spacing={2.5}>
                      <Box sx={{ ...flexStyles.between, mb: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                          Editing Field
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => setExpandedFieldIndex(null)}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: '#6366f1',
                            '&:hover': {
                              background: 'rgba(99, 102, 241, 0.1)',
                            },
                          }}
                        >
                          Done
                        </Button>
                      </Box>

                      {/* Field Editor - handles all field types */}
                      <FieldEditor
                        field={field}
                        onChange={(updates) => handleFieldChange(index, updates)}
                        readonly={readonly}
                      />
                    </Stack>
                  )}
                </Box>
              )
            })}

            {localForm.fields.length === 0 && (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  color: '#64748b',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 2,
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography sx={{ fontSize: '0.9375rem' }}>
                  No fields added yet. Click "Add Field" to get started.
                </Typography>
              </Box>
            )}
          </Stack>

          {!readonly && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={addField}
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#6366f1',
                  background: 'rgba(99, 102, 241, 0.05)',
                  '&:hover': {
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                }}
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
            sx={{
              fontSize: '1rem',
              py: 1.5,
              ...buttonStyles.primary,
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#64748b',
                boxShadow: 'none',
              },
            }}
          >
            {isSaving ? 'Saving...' : localForm.id ? 'Save Changes' : 'Create Form'}
          </Button>
        )}
      </Stack>
    </Paper>
  )
}

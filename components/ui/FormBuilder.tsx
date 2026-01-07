'use client'

import { useState, useRef, useEffect } from 'react'
import { Box, Button, Paper, Typography, TextField, Stack, IconButton, MenuItem, FormControlLabel, Switch } from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { FormField } from '@/components/ui/FormField'
import { FormInput } from '@/components/ui/FormInput'
import { layoutStyles, buttonStyles, flexStyles } from '@/theme'

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

  const handleFieldTypeChange = (index: number, newType: FormFieldType) => {
    const updatedFields = [...localForm.fields]
    updatedFields[index] = { ...updatedFields[index], type: newType }
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

                      <FormField label="Field Label" required>
                        <TextField
                          fullWidth
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, { label: e.target.value })}
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

                      <FormField label="Field Type">
                        <TextField
                          fullWidth
                          select
                          value={field.type}
                          onChange={(e) => {
                            const newType = e.target.value as FormFieldType
                            handleFieldTypeChange(index, newType)
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
                          {['text', 'textarea', 'date', 'radio', 'checkbox'].map((type) => (
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

                      <FormField label="Placeholder">
                        <TextField
                          fullWidth
                          value={field.placeholder || ''}
                          onChange={(e) => handleFieldChange(index, { placeholder: e.target.value })}
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
                              onChange={() => handleFieldChange(index, { required: !field.required })}
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

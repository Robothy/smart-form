'use client'

import { useFrontendTool } from '@copilotkit/react-core'
import type { FormFieldData, FormFieldType } from '@/components/forms/edit/fieldEditors'

export interface FormToolsConfig {
  formTitle: string
  formDescription: string | undefined
  fields: FormFieldData[]
  onUpdateForm: (updates: { title?: string; description?: string; fields?: FormFieldData[] }) => void
}

/**
 * Hook that registers frontend tools for form editing
 * These tools allow the AI agent to modify the form
 */
export function useFormTools(config: FormToolsConfig) {
  const { formTitle, formDescription, fields, onUpdateForm } = config

  // Tool: Update form title
  useFrontendTool({
    name: 'updateFormTitle',
    description: 'Update the title of the form',
    parameters: [
      {
        name: 'title',
        type: 'string',
        description: 'The new title for the form',
        required: true,
      },
    ],
    handler: async (args) => {
      onUpdateForm({ title: (args as { title: string }).title })
      return `Form title updated to: ${(args as { title: string }).title}`
    },
  })

  // Tool: Update form description
  useFrontendTool({
    name: 'updateFormDescription',
    description: 'Update the description of the form',
    parameters: [
      {
        name: 'description',
        type: 'string',
        description: 'The new description for the form',
        required: true,
      },
    ],
    handler: async (args) => {
      onUpdateForm({ description: (args as { description: string }).description })
      return `Form description updated`
    },
  })

  // Tool: Add a new field
  useFrontendTool({
    name: 'addField',
    description: 'Add a new field to the form',
    parameters: [
      {
        name: 'type',
        type: 'string',
        description: 'The type of field (text, textarea, date, radio, checkbox)',
        required: true,
      },
      {
        name: 'label',
        type: 'string',
        description: 'The label for the field',
        required: true,
      },
      {
        name: 'placeholder',
        type: 'string',
        description: 'Optional placeholder text for the field',
        required: false,
      },
      {
        name: 'required',
        type: 'boolean',
        description: 'Whether the field is required',
        required: false,
      },
      {
        name: 'options',
        type: 'object[]',
        description: 'Options for radio/checkbox fields (array of {label, value} objects)',
        required: false,
        attributes: [
          { name: 'label', type: 'string' },
          { name: 'value', type: 'string' },
        ],
      },
    ],
    handler: async (args) => {
      const { type, label, placeholder, required, options } = args as {
        type: string
        label: string
        placeholder?: string
        required?: boolean
        options?: { label: string; value: string }[]
      }
      const newField: FormFieldData = {
        type: type as FormFieldType,
        label,
        placeholder,
        required: required ?? false,
        options,
        order: fields.length,
      }
      onUpdateForm({ fields: [...fields, newField] })
      return `Added new ${type} field: ${label}`
    },
  })

  // Tool: Update an existing field
  useFrontendTool({
    name: 'updateField',
    description: 'Update an existing field in the form',
    parameters: [
      {
        name: 'fieldIndex',
        type: 'number',
        description: 'The index of the field to update (0-based)',
        required: true,
      },
      {
        name: 'updates',
        type: 'object',
        description: 'The updates to apply to the field',
        required: true,
        attributes: [
          { name: 'label', type: 'string' },
          { name: 'placeholder', type: 'string' },
          { name: 'required', type: 'boolean' },
          { name: 'type', type: 'string' },
        ],
      },
    ],
    handler: async (args) => {
      const { fieldIndex, updates } = args as {
        fieldIndex: number
        updates: Partial<Pick<FormFieldData, 'label' | 'placeholder' | 'required' | 'type'>>
      }
      if (fieldIndex < 0 || fieldIndex >= fields.length) {
        throw new Error(`Invalid field index: ${fieldIndex}`)
      }
      const updatedFields = [...fields]
      updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...updates }
      onUpdateForm({ fields: updatedFields })
      return `Updated field at index ${fieldIndex}`
    },
  })

  // Tool: Remove a field
  useFrontendTool({
    name: 'removeField',
    description: 'Remove a field from the form',
    parameters: [
      {
        name: 'fieldIndex',
        type: 'number',
        description: 'The index of the field to remove (0-based)',
        required: true,
      },
    ],
    handler: async (args) => {
      const { fieldIndex } = args as { fieldIndex: number }
      if (fieldIndex < 0 || fieldIndex >= fields.length) {
        throw new Error(`Invalid field index: ${fieldIndex}`)
      }
      const updatedFields = fields.filter((_, i) => i !== fieldIndex)
      onUpdateForm({ fields: updatedFields })
      return `Removed field at index ${fieldIndex}`
    },
  })

  // Tool: Get form summary
  useFrontendTool({
    name: 'getFormSummary',
    description: 'Get a summary of the current form state',
    parameters: [],
    handler: async () => {
      return {
        title: formTitle,
        description: formDescription || null,
        fieldCount: fields.length,
        fields: fields.map((f, i) => ({
          index: i,
          type: f.type,
          label: f.label || '(Untitled)',
          required: f.required,
        })),
      }
    },
  })
}

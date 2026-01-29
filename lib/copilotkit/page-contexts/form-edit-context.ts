'use client'

import { useRef, useEffect } from 'react'
import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import type { FormFieldData, FormFieldType } from '@/components/forms/edit/fieldEditors'

export interface FormEditContextConfig {
  form?: {
    id?: string
    title: string
    description?: string
    fields: FormFieldData[]
    status: string
    slug?: string | null
  }
  onUpdateForm: (
    updates:
      | { title?: string; description?: string; fields?: FormFieldData[] }
      | ((current: {
          title: string
          description: string | undefined
          fields: FormFieldData[]
        }) => { title?: string; description?: string; fields?: FormFieldData[] })
  ) => void | Promise<void>
  onSave?: () => Promise<void>
  onPublish?: () => Promise<void>
}

/**
 * Hook that registers AI tools for form editing pages
 * Migrated from the original useFormTools hook
 * Adds saveForm and publishForm tools
 */
export function useFormEditContext(config: FormEditContextConfig) {
  const { form, onUpdateForm, onSave, onPublish } = config

  // Use a ref to track the latest form state synchronously
  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])

  // Share form state with the AI
  useCopilotReadable({
    description: 'Current form state including title, description, and all fields',
    value: JSON.stringify(
      {
        id: form?.id || 'new form',
        title: form?.title || '',
        description: form?.description,
        status: form?.status || 'draft',
        slug: form?.slug,
        fields: (form?.fields || []).map((f) => ({
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          options: f.options,
          order: f.order,
        })),
      },
      null,
      2
    ),
  })

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
      const { title } = args as { title: string }
      await onUpdateForm(() => ({ title }))
      return `Form title updated to: ${title}`
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
      const { description } = args as { description: string }
      await onUpdateForm(() => ({ description }))
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
      await onUpdateForm((current) => {
        const newField: FormFieldData = {
          type: type as FormFieldType,
          label,
          placeholder,
          required: required ?? false,
          options,
          order: current.fields.length,
        }
        return { fields: [...current.fields, newField] }
      })
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
      await onUpdateForm((current) => {
        if (fieldIndex < 0 || fieldIndex >= current.fields.length) {
          throw new Error(`Invalid field index: ${fieldIndex}`)
        }
        const updatedFields = [...current.fields]
        updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...updates }
        return { fields: updatedFields }
      })
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
      await onUpdateForm((current) => {
        if (fieldIndex < 0 || fieldIndex >= current.fields.length) {
          throw new Error(`Invalid field index: ${fieldIndex}`)
        }
        const updatedFields = current.fields.filter((_, i) => i !== fieldIndex)
        return { fields: updatedFields }
      })
      return `Removed field at index ${fieldIndex}`
    },
  })

  // Tool: Get form summary
  useFrontendTool({
    name: 'getFormSummary',
    description: 'Get a summary of the current form state',
    parameters: [],
    handler: async () => {
      const current = formRef.current
      if (!current) {
        return { error: 'No form loaded' }
      }
      return {
        id: current.id || 'new form',
        title: current.title,
        description: current.description || null,
        status: current.status,
        slug: current.slug || null,
        fieldCount: current.fields.length,
        fields: current.fields.map((f, i) => ({
          index: i,
          type: f.type,
          label: f.label || '(Untitled)',
          required: f.required,
        })),
      }
    },
  })

  // Tool: Save form (if onSave callback provided)
  if (onSave) {
    useFrontendTool({
      name: 'saveForm',
      description: 'Save the current form (saves title, description, and all fields)',
      parameters: [],
      handler: async () => {
        const current = formRef.current
        if (!current) {
          throw new Error('Cannot save: no form loaded')
        }
        await onSave()
        return `Form "${current.title}" saved successfully`
      },
    })
  }

  // Tool: Publish form (if onPublish callback provided)
  if (onPublish) {
    useFrontendTool({
      name: 'publishForm',
      description: 'Publish the form to make it publicly accessible with a shareable link',
      parameters: [],
      handler: async () => {
        const current = formRef.current
        if (!current) {
          throw new Error('Cannot publish: no form loaded')
        }
        await onPublish()
        return `Form "${current.title}" published successfully`
      },
    })
  }
}

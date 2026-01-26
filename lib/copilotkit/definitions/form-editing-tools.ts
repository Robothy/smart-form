'use client'

import { toolRegistry, type ToolContext, type ToolGroupDefinition } from '../tools-registry'
import type { FormFieldData } from '@/components/forms/edit/fieldEditors'

/**
 * Form Editing Tools Definition
 *
 * These tools are available on form editing pages (new and edit)
 * and allow the AI assistant to modify the form.
 */

const formEditingTools: ToolGroupDefinition = {
  name: 'form-editing',
  description: 'Tools for editing forms on the new/edit form pages',
  tools: [
    {
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
      handler: async ({ title }, context) => {
        const updateForm = context.getState('updateForm')
        if (!updateForm) {
          throw new Error('Form update function not available')
        }
        await updateForm({ title })
        return `Form title updated to: ${title}`
      },
    },
    {
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
      handler: async ({ description }, context) => {
        const updateForm = context.getState('updateForm')
        if (!updateForm) {
          throw new Error('Form update function not available')
        }
        await updateForm({ description })
        return `Form description updated`
      },
    },
    {
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
      handler: async ({ type, label, placeholder, required, options }, context) => {
        const updateForm = context.getState('updateForm')
        if (!updateForm) {
          throw new Error('Form update function not available')
        }

        const currentState = context.getState('formState') || { fields: [] }
        const newField: FormFieldData = {
          type: type as any,
          label,
          placeholder,
          required: required ?? false,
          options,
          order: currentState.fields.length,
        }

        await updateForm({ fields: [...currentState.fields, newField] })
        return `Added new ${type} field: ${label}`
      },
    },
    {
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
      handler: async ({ fieldIndex, updates }, context) => {
        const updateForm = context.getState('updateForm')
        if (!updateForm) {
          throw new Error('Form update function not available')
        }

        const currentState = context.getState('formState') || { fields: [] }
        if (fieldIndex < 0 || fieldIndex >= currentState.fields.length) {
          throw new Error(`Invalid field index: ${fieldIndex}`)
        }

        const updatedFields = [...currentState.fields]
        updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...updates }

        await updateForm({ fields: updatedFields })
        return `Updated field at index ${fieldIndex}`
      },
    },
    {
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
      handler: async ({ fieldIndex }, context) => {
        const updateForm = context.getState('updateForm')
        if (!updateForm) {
          throw new Error('Form update function not available')
        }

        const currentState = context.getState('formState') || { fields: [] }
        if (fieldIndex < 0 || fieldIndex >= currentState.fields.length) {
          throw new Error(`Invalid field index: ${fieldIndex}`)
        }

        const updatedFields = currentState.fields.filter((_: any, i: number) => i !== fieldIndex)
        await updateForm({ fields: updatedFields })
        return `Removed field at index ${fieldIndex}`
      },
    },
    {
      name: 'getFormSummary',
      description: 'Get a summary of the current form state',
      parameters: [],
      handler: async (_args, context) => {
        const currentState = context.getState('formState') || { title: '', description: '', fields: [] }
        return {
          title: currentState.title,
          description: currentState.description || null,
          fieldCount: currentState.fields.length,
          fields: currentState.fields.map((f: any, i: number) => ({
            index: i,
            type: f.type,
            label: f.label || '(Untitled)',
            required: f.required,
          })),
        }
      },
    },
  ],
  readableDescriptions: [
    {
      description: 'Current form being edited including title, description, and all fields',
      getValue: (context) => {
        const formState = context.getState('formState') || { title: '', description: '', status: 'draft', fields: [] }
        return JSON.stringify({
          title: formState.title,
          description: formState.description,
          status: formState.status,
          fields: formState.fields.map((f: any) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            required: f.required,
            options: f.options,
          })),
        })
      },
    },
  ],
}

// Register the form editing tools
toolRegistry.register(formEditingTools)

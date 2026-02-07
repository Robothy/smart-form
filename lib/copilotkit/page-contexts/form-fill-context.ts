'use client'

import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import type { FormFieldData } from '@/components/forms/fill/FormFieldRenderer'
import { useContextValues, useBaseContext } from './base-context'

export interface FormFillContextConfig {
  form?: {
    id: string
    title: string
    fields: FormFieldData[]
  }
  values: Record<string, string>
  errors: Record<string, string>
  onValueChange: (fieldId: string, value: string) => void
  onSubmit: () => Promise<void>
}

/**
 * Hook that registers AI tools for the form fill page
 * Provides capabilities for filling out forms and validation
 */
export function useFormFillContext(config: FormFillContextConfig) {
  const { form, values, errors, onValueChange, onSubmit } = config

  // Use refs for mutable state to avoid closure staleness
  const valuesRef = useContextValues(values)
  const errorsRef = useContextValues(errors)

  // Share form state with AI
  useCopilotReadable({
    description: 'Current form being filled, including field values and validation errors',
    value: JSON.stringify({
      form: form ? {
        id: form.id,
        title: form.title,
        fields: form.fields.map((f) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          options: f.options,
        })),
      } : null,
      values: valuesRef.current,
      errors: errorsRef.current,
    }),
  })

  // Tool: Set field value
  useFrontendTool({
    name: 'setFieldValue',
    description: 'Set the value of a specific form field by field label',
    parameters: [
      {
        name: 'fieldLabel',
        type: 'string',
        description: 'The label of the field to set',
        required: true,
      },
      {
        name: 'value',
        type: 'string',
        description: 'The value to set for the field',
        required: true,
      },
    ],
    handler: async (args) => {
      if (!form) {
        throw new Error('Form not loaded')
      }
      const { fieldLabel, value } = args as { fieldLabel: string; value: string }
      const field = form.fields.find((f) => f.label === fieldLabel)

      if (!field) {
        throw new Error(`Field with label "${fieldLabel}" not found`)
      }

      if (!field.id) {
        throw new Error(`Field "${fieldLabel}" has no ID`)
      }

      onValueChange(field.id, value)
      return `Set "${fieldLabel}" to: ${value}`
    },
  })

  // Tool: Validate field
  useFrontendTool({
    name: 'validateField',
    description: 'Check if a specific field has any validation errors',
    parameters: [
      {
        name: 'fieldLabel',
        type: 'string',
        description: 'The label of the field to validate',
        required: true,
      },
    ],
    handler: async (args) => {
      if (!form) {
        return { error: 'Form not loaded' }
      }
      const { fieldLabel } = args as { fieldLabel: string }
      const field = form.fields.find((f) => f.label === fieldLabel)

      if (!field) {
        throw new Error(`Field with label "${fieldLabel}" not found`)
      }

      if (!field.id) {
        return { field: fieldLabel, hasError: false, error: null }
      }

      const error = errorsRef.current[field.id]
      return {
        field: fieldLabel,
        hasError: !!error,
        error: error || null,
      }
    },
  })

  // Tool: Submit form
  useFrontendTool({
    name: 'submitForm',
    description: 'Submit the form with the current values',
    parameters: [],
    handler: async () => {
      if (!form) {
        throw new Error('Form not loaded')
      }
      // Check for required fields that are empty
      const missingRequiredFields: string[] = []
      for (const field of form.fields) {
        if (field.required && field.id) {
          const value = valuesRef.current[field.id]
          if (!value || value.trim() === '') {
            missingRequiredFields.push(field.label)
          }
        }
      }

      if (missingRequiredFields.length > 0) {
        throw new Error(
          `Cannot submit: missing required fields: ${missingRequiredFields.join(', ')}`
        )
      }

      await onSubmit()
      return 'Form submitted successfully'
    },
  })

  // Tool: Get field options
  useFrontendTool({
    name: 'getFieldOptions',
    description: 'Get the available options for a radio or checkbox field',
    parameters: [
      {
        name: 'fieldLabel',
        type: 'string',
        description: 'The label of the field',
        required: true,
      },
    ],
    handler: async (args) => {
      if (!form) {
        return { error: 'Form not loaded' }
      }
      const { fieldLabel } = args as { fieldLabel: string }
      const field = form.fields.find((f) => f.label === fieldLabel)

      if (!field) {
        throw new Error(`Field with label "${fieldLabel}" not found`)
      }

      if (field.type !== 'radio' && field.type !== 'checkbox') {
        return {
          field: fieldLabel,
          type: field.type,
          options: null,
          message: 'This field type does not have options',
        }
      }

      return {
        field: fieldLabel,
        type: field.type,
        options: field.options || [],
      }
    },
  })

  // Tool: Get form questions
  useFrontendTool({
    name: 'getFormQuestions',
    description: 'Get a list of all questions/fields in the form',
    parameters: [],
    handler: async () => {
      if (!form) {
        return { error: 'Form not loaded' }
      }
      return {
        formTitle: form.title,
        fieldCount: form.fields.length,
        fields: form.fields.map((f, i) => ({
          index: i + 1,
          label: f.label,
          type: f.type,
          required: f.required,
          hasOptions: f.type === 'radio' || f.type === 'checkbox',
        })),
      }
    },
  })

  // Tool: Get current form values
  useFrontendTool({
    name: 'getFormValues',
    description: 'Get the current values filled in the form',
    parameters: [],
    handler: async () => {
      if (!form) {
        return { error: 'Form not loaded' }
      }
      const currentValues = form.fields
        .filter((f) => f.id && valuesRef.current[f.id])
        .map((f) => ({
          field: f.label,
          value: valuesRef.current[f.id!],
        }))

      return {
        formTitle: form.title,
        filledCount: currentValues.length,
        totalFields: form.fields.length,
        values: currentValues,
      }
    },
  })

  // Signal that all tools for this page are registered
  useBaseContext()
}

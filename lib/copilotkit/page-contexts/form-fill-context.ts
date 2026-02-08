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

  // Tool: Set form values
  useFrontendTool({
    name: 'setFormValues',
    description: 'Set all form field values at once. Pass an object mapping field IDs to values.',
    parameters: [
      {
        name: 'values',
        type: 'object',
        description: 'Object with field IDs as keys and field values as values',
        required: true,
      },
    ],
    handler: async (args) => {
      if (!form) {
        return { success: false, error: 'Form not loaded' }
      }

      const { values } = args as { values: Record<string, string> }
      const validFieldIds = new Set(form.fields.map((f) => f.id).filter(Boolean))
      const invalidIds: string[] = []
      let setCount = 0

      for (const [fieldId, value] of Object.entries(values)) {
        if (validFieldIds.has(fieldId)) {
          onValueChange(fieldId, value)
          setCount++
        } else {
          invalidIds.push(fieldId)
        }
      }

      if (invalidIds.length > 0) {
        return {
          success: false,
          error: 'Invalid field IDs',
          invalidIds,
          validIds: Array.from(validFieldIds),
          message: `Set ${setCount} field(s), ${invalidIds.length} invalid ID(s) ignored`,
        }
      }

      return { success: true, message: `Set ${setCount} field(s)` }
    },
  })

  // Tool: Submit form
  useFrontendTool({
    name: 'submitForm',
    description: 'Submit the form with the current values. Validates all fields before submitting.',
    parameters: [],
    handler: async () => {
      if (!form) {
        return { success: false, error: 'Form not loaded' }
      }

      // Check for validation errors
      const currentErrors = errorsRef.current
      if (Object.keys(currentErrors).length > 0) {
        const errorList = Object.entries(currentErrors).map(([fieldId, error]) => {
          const field = form.fields.find((f) => f.id === fieldId)
          return { field: field?.label || fieldId, error }
        })
        return {
          success: false,
          error: 'Form has validation errors',
          validationErrors: errorList,
        }
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
        return {
          success: false,
          error: 'Missing required fields',
          missingFields: missingRequiredFields,
        }
      }

      try {
        await onSubmit()
        return { success: true, message: 'Form submitted successfully' }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to submit form',
        }
      }
    },
  })

  // Tool: Get form information
  useFrontendTool({
    name: 'getFormInfo',
    description: 'Get the form definition including title, description, and field information',
    parameters: [],
    handler: async () => {
      if (!form) {
        return { error: 'Form not loaded' }
      }
      return {
        id: form.id,
        title: form.title,
        fieldCount: form.fields.length,
        fields: form.fields.map((f, i) => ({
          index: i + 1,
          id: f.id,
          label: f.label,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder,
          options: f.options,
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
        .filter((f) => f.id)
        .map((f) => ({
          id: f.id,
          label: f.label,
          value: valuesRef.current[f.id!] || '',
        }))

      return {
        formTitle: form.title,
        values: currentValues,
      }
    },
  })

  // Signal that all tools for this page are registered
  useBaseContext()
}

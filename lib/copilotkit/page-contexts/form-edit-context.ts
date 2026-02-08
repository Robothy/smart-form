'use client'

import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import { useRouter } from 'next/navigation'
import type { FormFieldData, FormFieldType } from '@/components/forms/edit/fieldEditors'
import { useContextValues, useBaseContext, navigateAndWait, waitForToolsReady } from './base-context'

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
  onSave?: () => Promise<{ id: string; title: string; status: string; slug?: string | null }>
  onPublish?: () => Promise<{ id: string; title: string; status: string; slug?: string | null }>
}

/**
 * Hook that registers AI tools for form editing pages
 * Simplified to a single updateForm tool + save/publish tools
 */
export function useFormEditContext(config: FormEditContextConfig) {
  const { form, onUpdateForm, onSave, onPublish } = config
  const router = useRouter()

  const formRef = useContextValues(form)

  // Build readable value safely
  const getReadableValue = (): string => {
    if (!form) {
      return JSON.stringify({ status: 'loading', message: 'No form loaded yet' })
    }

    try {
      return JSON.stringify(
        {
          id: form.id || 'new form',
          title: form.title || '',
          description: form.description || null,
          status: form.status || 'draft',
          slug: form.slug || null,
          fields: (form.fields || []).map((f) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder || null,
            required: Boolean(f.required),
            options: f.options || null,
            order: typeof f.order === 'number' ? f.order : null,
          })),
        },
        null,
        2
      )
    } catch (err) {
      return JSON.stringify({ error: 'Failed to serialize form', message: err instanceof Error ? err.message : String(err) })
    }
  }

  useCopilotReadable({
    description: 'Current form state including title, description, and all fields',
    value: getReadableValue(),
  })

  useFrontendTool({
    name: 'updateForm',
    description: 'Update the form. Set title/description and perform field operations using labels to identify fields. Operations: remove (by label), update (by label), add. Use existing field labels to target updates/removals.',
    parameters: [
      { name: 'title', type: 'string', description: 'Form title', required: false },
      { name: 'description', type: 'string', description: 'Form description', required: false },
      {
        name: 'operations',
        type: 'object[]',
        description: 'Field operations: {action: "remove", target: "label"} or {action: "update", target: "label", changes: {...}} or {action: "add", field: {type, label, required, placeholder, options?, order}}. IMPORTANT: For radio/checkbox types, options must be an array of objects with {label: string, value: string} structure, NOT strings. Example: options: [{label: "Male", value: "male"}, {label: "Female", value: "female"}]',
        required: false,
        attributes: [
          { name: 'action', type: 'string', description: 'Operation: "add", "update", or "remove"' },
          { name: 'target', type: 'string', description: 'Field label to target (for update/remove)', required: false },
          { name: 'changes', type: 'object', description: 'Changes to apply (for update)', required: false },
          {
            name: 'field',
            type: 'object',
            description: 'Field to add (for add action)',
            required: false,
            attributes: [
              { name: 'type', type: 'string', description: 'Field type: "text", "textarea", "date", "radio", or "checkbox"' },
              { name: 'label', type: 'string', description: 'Field label' },
              { name: 'placeholder', type: 'string', description: 'Placeholder text (for text/textarea/date)', required: false },
              { name: 'required', type: 'boolean', description: 'Whether field is required', required: false },
              {
                name: 'options',
                type: 'object[]',
                description: 'REQUIRED for radio/checkbox: Array of {label: string, value: string} objects. Example: [{label: "Option 1", value: "opt1"}, {label: "Option 2", value: "opt2"}]',
                required: false,
                attributes: [
                  { name: 'label', type: 'string', description: 'Display label for the option' },
                  { name: 'value', type: 'string', description: 'Internal value for the option' },
                ],
              },
              { name: 'order', type: 'number', description: 'Display order', required: false },
            ],
          },
        ],
      },
    ],
    handler: async (args) => {
      type Operation =
        | { action: 'remove'; target: string }
        | { action: 'update'; target: string; changes?: Partial<Pick<FormFieldData, 'label' | 'placeholder' | 'required' | 'type' | 'options'>> }
        | { action: 'add'; field: Omit<FormFieldData, 'id' | 'order'> }

      const { title, description, operations } = args as {
        title?: string
        description?: string
        operations?: Operation[]
      }

      await onUpdateForm((current) => {
        let fields = [...current.fields]
        const updates: { title?: string; description?: string; fields?: FormFieldData[] } = {}

        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description

        if (operations?.length) {
          for (const op of operations) {
            switch (op.action) {
              case 'remove': {
                const idx = fields.findIndex((f) => f.label === op.target)
                if (idx >= 0) fields.splice(idx, 1)
                break
              }
              case 'update': {
                const idx = fields.findIndex((f) => f.label === op.target)
                if (idx >= 0 && op.changes) {
                  // Validate options format for radio/checkbox fields
                  if (op.changes.options && (op.changes.type === 'radio' || op.changes.type === 'checkbox' || fields[idx].type === 'radio' || fields[idx].type === 'checkbox')) {
                    if (!Array.isArray(op.changes.options)) {
                      throw new Error(`Field "${op.target}": options must be an array`)
                    }
                    // Check if any option is a string (wrong format)
                    if (op.changes.options.some((opt: any) => typeof opt === 'string')) {
                      throw new Error(`Field "${op.target}": options must be an array of objects with {label, value} structure, not strings. Got: ${JSON.stringify(op.changes.options)}`)
                    }
                    // Validate each option has label and value
                    for (let i = 0; i < op.changes.options.length; i++) {
                      const opt = op.changes.options[i]
                      if (!opt || typeof opt !== 'object') {
                        throw new Error(`Field "${op.target}": option at index ${i} is not an object`)
                      }
                      if (typeof opt.label !== 'string' || typeof opt.value !== 'string') {
                        throw new Error(`Field "${op.target}": option at index ${i} must have string label and value properties`)
                      }
                    }
                  }
                  fields[idx] = { ...fields[idx], ...op.changes }
                }
                break
              }
              case 'add': {
                const newFieldData = op.field as any
                // Validate options format for radio/checkbox fields
                if ((newFieldData.type === 'radio' || newFieldData.type === 'checkbox') && newFieldData.options) {
                  if (!Array.isArray(newFieldData.options)) {
                    throw new Error(`Field "${newFieldData.label}": options must be an array`)
                  }
                  // Check if any option is a string (wrong format)
                  if (newFieldData.options.some((opt: any) => typeof opt === 'string')) {
                    throw new Error(`Field "${newFieldData.label}": options must be an array of objects with {label, value} structure, not strings. Got: ${JSON.stringify(newFieldData.options)}`)
                  }
                  // Validate each option has label and value
                  for (let i = 0; i < newFieldData.options.length; i++) {
                    const opt = newFieldData.options[i]
                    if (!opt || typeof opt !== 'object') {
                      throw new Error(`Field "${newFieldData.label}": option at index ${i} is not an object`)
                    }
                    if (typeof opt.label !== 'string' || typeof opt.value !== 'string') {
                      throw new Error(`Field "${newFieldData.label}": option at index ${i} must have string label and value properties`)
                    }
                  }
                }
                const newField: FormFieldData = {
                  ...newFieldData,
                  id: crypto.randomUUID(),
                  order: fields.length,
                }
                fields.push(newField)
                break
              }
            }
          }
        }

        updates.fields = fields
        return updates
      })

      const parts: string[] = []
      if (title !== undefined) parts.push(`title`)
      if (description !== undefined) parts.push(`description`)
      if (operations?.length) {
        const removes = operations.filter((o) => o.action === 'remove').length
        const updates = operations.filter((o) => o.action === 'update').length
        const adds = operations.filter((o) => o.action === 'add').length
        if (removes) parts.push(`${removes} removed`)
        if (updates) parts.push(`${updates} updated`)
        if (adds) parts.push(`${adds} added`)
      }
      return `Updated: ${parts.join(', ') || 'nothing'}`
    },
  })

  useFrontendTool({
    name: 'getForm',
    description: 'Get the current form structure including title, description, and all fields with their labels, types, options (for radio/checkbox), and order',
    parameters: [],
    handler: async () => {
      const current = formRef.current
      if (!current) {
        return { error: 'No form loaded' }
      }
      return {
        title: current.title,
        description: current.description || null,
        status: current.status,
        slug: current.slug,
        fields: current.fields.map((f) => ({
          label: f.label,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder,
          options: f.options,
          order: f.order,
        })),
      }
    },
  })

  if (onSave) {
    useFrontendTool({
      name: 'saveForm',
      description: 'Save the current form. Returns the form id and title. Waits for navigation to complete if this is a new form (redirects to edit page with publishForm tool available).',
      parameters: [],
      handler: async () => {
        const result = await onSave()
        // Wait for navigation to complete - for new forms, the page redirects to edit page
        // which has the publishForm tool. For existing forms, this just waits briefly.
        return await waitForToolsReady(`Form ${result.id} (${result.title}) saved`, 8000)
      },
    })
  }

  if (onPublish) {
    useFrontendTool({
      name: 'publishForm',
      description: 'Publish the form to make it publicly accessible. Returns the form id and title. Waits for navigation to complete.',
      parameters: [],
      handler: async () => {
        // Call onPublish directly - the caller (edit page) has the actual form data
        // and will validate it. The formRef may be stale due to when tools were registered.
        const result = await onPublish()

        // Wait for navigation to view page (triggered by use-form-publish hook)
        return await navigateAndWait(router, `/forms/${result.id}/view`, `Form ${result.id} (${result.title}) published`, 20000)
      },
    })
  }

  // Signal that all tools for this page are registered
  useBaseContext()
}

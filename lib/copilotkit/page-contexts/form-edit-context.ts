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
 * Simplified to a single updateForm tool + save/publish tools
 */
export function useFormEditContext(config: FormEditContextConfig) {
  const { form, onUpdateForm, onSave, onPublish } = config

  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])

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

  useFrontendTool({
    name: 'updateForm',
    description: 'Update the form. Set title/description and perform field operations using labels to identify fields. Operations: remove (by label), update (by label), add. Use existing field labels to target updates/removals.',
    parameters: [
      { name: 'title', type: 'string', description: 'Form title', required: false },
      { name: 'description', type: 'string', description: 'Form description', required: false },
      {
        name: 'operations',
        type: 'object[]',
        description: 'Field operations: {action: "remove", target: "label"} or {action: "update", target: "label", changes: {...}} or {action: "add", field: {...}}',
        required: false,
        attributes: [
          { name: 'action', type: 'string' },
          { name: 'target', type: 'string' },
          { name: 'changes', type: 'object' },
          { name: 'field', type: 'object' },
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
                  fields[idx] = { ...fields[idx], ...op.changes }
                }
                break
              }
              case 'add': {
                const newField: FormFieldData = {
                  ...op.field,
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
    description: 'Get the current form structure including title, description, and all fields with their labels and types',
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
        fields: current.fields.map((f) => ({
          label: f.label,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder,
        })),
      }
    },
  })

  if (onSave) {
    useFrontendTool({
      name: 'saveForm',
      description: 'Save the current form',
      parameters: [],
      handler: async () => {
        const current = formRef.current
        if (!current) throw new Error('Cannot save: no form loaded')
        await onSave()
        return `Form "${current.title}" saved`
      },
    })
  }

  if (onPublish) {
    useFrontendTool({
      name: 'publishForm',
      description: 'Publish the form to make it publicly accessible',
      parameters: [],
      handler: async () => {
        const current = formRef.current
        if (!current) throw new Error('Cannot publish: no form loaded')
        await onPublish()
        return `Form "${current.title}" published`
      },
    })
  }
}

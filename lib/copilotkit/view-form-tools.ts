'use client'

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import type { FormData } from '@/components/ui/FormBuilder'

export interface ViewFormToolsConfig {
  form: FormData | null
  formId: string
  onCopyShareableLink?: () => Promise<void>
  onViewSubmissions?: () => void
  onEditForm?: () => void
}

/**
 * Hook that registers tools for viewing form details
 * Allows the assistant to provide form information and actions
 */
export function useViewFormTools(config: ViewFormToolsConfig) {
  const { form, formId, onCopyShareableLink, onViewSubmissions, onEditForm } = config

  // Share form context with the assistant
  useCopilotReadable({
    description: 'Current form details including title, description, fields, status, and shareable link',
    value: JSON.stringify(
      form
        ? {
            formId: form.id,
            title: form.title,
            description: form.description,
            status: form.status,
            slug: form.slug,
            fieldCount: form.fields?.length || 0,
            fields: form.fields?.map((f) => ({
              label: f.label,
              type: f.type,
              required: f.required,
            })),
          }
        : { status: 'loading' },
    ),
  })

  // Tool to copy shareable link
  useCopilotAction({
    name: 'copyShareableLink',
    description: 'Copy the shareable link for this form to clipboard',
    parameters: [],
    handler: async () => {
      if (!form || form.status !== 'published' || !form.slug) {
        throw new Error('Form must be published to have a shareable link')
      }

      const link = `${window.location.origin}/forms/share/${form.slug}`
      await navigator.clipboard.writeText(link)
      return { success: true, link }
    },
  })

  // Tool to navigate to submissions (if callback provided)
  if (onViewSubmissions) {
    useCopilotAction({
      name: 'viewSubmissions',
      description: 'Navigate to the submissions page for this form',
      parameters: [],
      handler: async () => {
        if (!form || form.status !== 'published') {
          throw new Error('Form must be published to have submissions')
        }

        onViewSubmissions()
        return { success: true, path: `/forms/${formId}/submissions` }
      },
    })
  }

  // Tool to navigate to edit page (for draft forms, if callback provided)
  if (onEditForm) {
    useCopilotAction({
      name: 'editForm',
      description: 'Navigate to the edit page for this draft form',
      parameters: [],
      handler: async () => {
        if (!form) {
          throw new Error('Form is not loaded yet')
        }

        if (form.status === 'published') {
          throw new Error('Published forms cannot be edited')
        }

        onEditForm()
        return { success: true, path: `/forms/${formId}/edit` }
      },
    })
  }
}

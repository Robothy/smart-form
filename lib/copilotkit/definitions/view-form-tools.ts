'use client'

import { toolRegistry, type ToolContext, type ToolGroupDefinition } from '../tools-registry'

/**
 * Form Viewing Tools Definition
 *
 * These tools are available on the form view page and allow
 * the AI assistant to provide form information and actions.
 */

const viewFormTools: ToolGroupDefinition = {
  name: 'form-viewing',
  description: 'Tools for viewing form details on the view page',
  tools: [
    {
      name: 'copyShareableLink',
      description: 'Copy the shareable link for this form to clipboard',
      parameters: [],
      handler: async (_args, context) => {
        const form = context.getState('viewForm')

        if (!form || form.status !== 'published' || !form.slug) {
          throw new Error('Form must be published to have a shareable link')
        }

        const link = `${window.location.origin}/forms/share/${form.slug}`
        await navigator.clipboard.writeText(link)
        return { success: true, link }
      },
    },
    {
      name: 'viewSubmissions',
      description: 'Navigate to the submissions page for this form',
      parameters: [],
      handler: async (_args, context) => {
        const form = context.getState('viewForm')

        if (!form || form.status !== 'published') {
          throw new Error('Form must be published to have submissions')
        }

        const formId = context.getState('viewFormId')
        if (!formId) {
          throw new Error('Form ID not available')
        }

        context.router.push(`/forms/${formId}/submissions`)
        return { success: true, path: `/forms/${formId}/submissions` }
      },
    },
    {
      name: 'editForm',
      description: 'Navigate to the edit page for this draft form',
      parameters: [],
      handler: async (_args, context) => {
        const form = context.getState('viewForm')

        if (!form) {
          throw new Error('Form is not loaded yet')
        }

        if (form.status === 'published') {
          throw new Error('Published forms cannot be edited')
        }

        const formId = context.getState('viewFormId')
        if (!formId) {
          throw new Error('Form ID not available')
        }

        context.router.push(`/forms/${formId}/edit`)
        return { success: true, path: `/forms/${formId}/edit` }
      },
    },
  ],
  readableDescriptions: [
    {
      description: 'Current form details including title, description, fields, status, and shareable link',
      getValue: (context) => {
        const form = context.getState('viewForm')

        return JSON.stringify(
          form
            ? {
                formId: form.id,
                title: form.title,
                description: form.description,
                status: form.status,
                slug: form.slug,
                fieldCount: form.fields?.length || 0,
                fields: form.fields?.map((f: any) => ({
                  label: f.label,
                  type: f.type,
                  required: f.required,
                })),
              }
            : { status: 'loading' },
        )
      },
    },
  ],
}

// Register the view form tools
toolRegistry.register(viewFormTools)

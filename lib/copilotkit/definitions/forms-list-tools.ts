'use client'

import { toolRegistry, type ToolContext, type ToolGroupDefinition } from '../tools-registry'

/**
 * Forms List Tools Definition
 *
 * These tools are available on the forms list page and allow
 * the AI assistant to interact with the forms list.
 */

const formsListTools: ToolGroupDefinition = {
  name: 'forms-list',
  description: 'Tools for interacting with the forms list page',
  tools: [
    {
      name: 'openForm',
      description: 'Open a specific form for editing or viewing',
      parameters: [
        {
          name: 'formId',
          type: 'string',
          description: 'The ID of the form to open',
          required: true,
        },
        {
          name: 'formTitle',
          type: 'string',
          description: 'The title of the form (for confirmation)',
          required: false,
        },
      ],
      handler: async ({ formId, formTitle }, context) => {
        const forms = context.getState('forms') || []
        const form = forms.find((f: any) => f.id === formId)

        if (!form) {
          throw new Error(`Form with ID ${formId} not found`)
        }

        const path = form.status === 'published' ? `/forms/${formId}/view` : `/forms/${formId}/edit`
        context.router.push(path)
        return { success: true, formTitle: form.title }
      },
    },
    {
      name: 'createNewForm',
      description: 'Navigate to create a new form',
      parameters: [],
      handler: async (_args, context) => {
        context.router.push('/forms/new')
        return { success: true }
      },
    },
    {
      name: 'filterForms',
      description: 'Filter the forms list by status',
      parameters: [
        {
          name: 'status',
          type: 'string',
          description: 'The status to filter by (all, draft, or published)',
          required: true,
        },
      ],
      handler: async ({ status }, context) => {
        if (status !== 'all' && status !== 'draft' && status !== 'published') {
          throw new Error('Invalid filter. Must be one of: all, draft, published')
        }
        context.dispatch({ type: 'SET_FILTER', payload: status })
        return { success: true, filter: status }
      },
    },
  ],
  readableDescriptions: [
    {
      description: 'Current forms list page showing all forms with counts and filter',
      getValue: (context) => {
        const forms = context.getState('forms') || []
        const counts = context.getState('counts') || { all: 0, draft: 0, published: 0 }
        const currentFilter = context.getState('currentFilter') || 'all'

        return JSON.stringify({
          page: 'forms-list',
          totalForms: counts.all,
          draftForms: counts.draft,
          publishedForms: counts.published,
          currentFilter: currentFilter,
          visibleForms: forms.map((f: any) => ({
            id: f.id,
            title: f.title,
            status: f.status,
            description: f.description,
            fieldsCount: f.fieldsCount,
            submissionsCount: f.submissionsCount,
            hasShareableLink: !!f.slug,
          })),
        })
      },
    },
  ],
}

// Register the forms list tools
toolRegistry.register(formsListTools)

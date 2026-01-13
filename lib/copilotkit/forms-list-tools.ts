'use client'

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'

export interface FormsListToolsConfig {
  forms: Array<{
    id: string
    title: string
    status: 'draft' | 'published'
    description?: string
    fieldsCount: number
    submissionsCount: number
    shareableLink?: string
    slug?: string | null
  }>
  counts: {
    all: number
    draft: number
    published: number
  }
  currentFilter: 'all' | 'draft' | 'published'
  onOpenForm: (formId: string, formTitle?: string) => void
  onCreateNewForm: () => void
  onFilterForms: (status: 'all' | 'draft' | 'published') => void
}

/**
 * Hook that registers tools for the forms list page
 * Allows the assistant to interact with the forms list
 */
export function useFormsListTools(config: FormsListToolsConfig) {
  const { forms, counts, currentFilter, onOpenForm, onCreateNewForm, onFilterForms } = config

  // Share forms list context with the assistant
  useCopilotReadable({
    description: 'Current forms list page showing all forms with counts and filter',
    value: JSON.stringify({
      page: 'forms-list',
      totalForms: counts.all,
      draftForms: counts.draft,
      publishedForms: counts.published,
      currentFilter: currentFilter,
      visibleForms: forms.map((f) => ({
        id: f.id,
        title: f.title,
        status: f.status,
        description: f.description,
        fieldsCount: f.fieldsCount,
        submissionsCount: f.submissionsCount,
        hasShareableLink: !!f.slug,
      })),
    }),
  })

  // Tool to navigate to a specific form
  useCopilotAction({
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
    handler: async ({ formId, formTitle }) => {
      const form = forms.find((f) => f.id === formId)
      if (!form) {
        throw new Error(`Form with ID ${formId} not found`)
      }
      onOpenForm(formId, formTitle)
      return { success: true, formTitle: form.title }
    },
  })

  // Tool to create a new form
  useCopilotAction({
    name: 'createNewForm',
    description: 'Navigate to create a new form',
    parameters: [],
    handler: async () => {
      onCreateNewForm()
      return { success: true }
    },
  })

  // Tool to change filter
  useCopilotAction({
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
    handler: async ({ status }) => {
      if (status !== 'all' && status !== 'draft' && status !== 'published') {
        throw new Error('Invalid filter. Must be one of: all, draft, published')
      }
      onFilterForms(status as 'all' | 'draft' | 'published')
      return { success: true, filter: status }
    },
  })
}

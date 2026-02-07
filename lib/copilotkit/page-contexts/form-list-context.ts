'use client'

import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import { useRouter } from 'next/navigation'
import { useContextValues, useBaseContext } from './base-context'

export interface FormListConfig {
  forms: Array<{
    id: string
    title: string
    status: string
    description?: string
    fieldsCount: number
    submissionsCount: number
    slug?: string | null
  }>
  currentFilter: string
  counts: {
    all: number
    draft: number
    published: number
  }
  onFilterChange: (filter: string) => void
  onCreateForm: () => void
}

/**
 * Hook that registers AI tools for the form list page
 * Provides capabilities for filtering, searching, and navigating forms
 */
export function useFormListContext(config: FormListConfig) {
  const { forms, currentFilter, counts, onFilterChange, onCreateForm } = config
  const router = useRouter()

  // Use refs for mutable state to avoid closure staleness
  const formsRef = useContextValues(forms)
  const countsRef = useContextValues(counts)
  const currentFilterRef = useContextValues(currentFilter)

  // Share current page state with AI
  useCopilotReadable({
    description: 'Current form list state including all forms, current filter, and counts',
    value: JSON.stringify({
      forms: formsRef.current.map((f) => ({
        id: f.id,
        title: f.title,
        status: f.status,
        description: f.description,
        fieldsCount: f.fieldsCount,
        submissionsCount: f.submissionsCount,
      })),
      currentFilter: currentFilterRef.current,
      counts: countsRef.current,
    }),
  })

  // Tool: Filter forms by status
  useFrontendTool({
    name: 'filterForms',
    description: 'Filter forms by their status (all, draft, or published)',
    parameters: [
      {
        name: 'filter',
        type: 'string',
        description: 'The filter to apply: "all", "draft", or "published"',
        required: true,
      },
    ],
    handler: async (args) => {
      const { filter } = args as { filter: string }
      if (['all', 'draft', 'published'].includes(filter)) {
        onFilterChange(filter)
        return `Filtered to show ${filter} forms`
      }
      throw new Error('Invalid filter. Must be "all", "draft", or "published"')
    },
  })

  // Tool: Search forms by title/description
  useFrontendTool({
    name: 'searchForms',
    description: 'Search forms by title or description (returns matching forms for user to review)',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'The search query to match against form titles and descriptions',
        required: true,
      },
    ],
    handler: async (args) => {
      const { query } = args as { query: string }
      const searchQuery = query.toLowerCase()
      const matchingForms = formsRef.current.filter(
        (f) =>
          f.title.toLowerCase().includes(searchQuery) ||
          (f.description && f.description.toLowerCase().includes(searchQuery))
      )

      return {
        query,
        count: matchingForms.length,
        forms: matchingForms.map((f) => ({
          id: f.id,
          title: f.title,
          status: f.status,
          fieldsCount: f.fieldsCount,
          submissionsCount: f.submissionsCount,
        })),
      }
    },
  })

  // Tool: Get forms summary
  useFrontendTool({
    name: 'getFormsSummary',
    description: 'Get a summary of all forms including counts and recent forms',
    parameters: [],
    handler: async () => {
      const currentForms = formsRef.current
      const currentCounts = countsRef.current

      return {
        totalCount: currentCounts.all,
        draftCount: currentCounts.draft,
        publishedCount: currentCounts.published,
        recentForms: currentForms.slice(0, 5).map((f) => ({
          id: f.id,
          title: f.title,
          status: f.status,
          fieldsCount: f.fieldsCount,
          submissionsCount: f.submissionsCount,
        })),
      }
    },
  })

  // Signal that all tools for this page are registered
  useBaseContext()
}

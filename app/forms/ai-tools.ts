'use client'

import { useFormListContext } from '@/lib/copilotkit/page-contexts'

/**
 * AI tools for the form list page
 * Registers tools for filtering, searching, and navigating forms
 */
export function usePageAiTools(config: {
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
}) {
  useFormListContext(config)
}

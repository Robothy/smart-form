'use client'

import { useSubmissionsContext } from '@/lib/copilotkit/page-contexts'

/**
 * AI tools for the submissions page
 * Registers tools for viewing, analyzing, and exporting submissions
 */
export function usePageAiTools(config: {
  formId: string
  formTitle: string
  fields: Array<{
    id: string
    label: string
    type: string
    required: boolean
  }>
  submissions: Array<{
    id: string
    data: Record<string, unknown>
    submittedAt: string
  }>
  totalCount: number
  page: number
  rowsPerPage: number
  onExport?: (format: string) => Promise<void>
  onSearch?: (query: string) => void
}) {
  useSubmissionsContext({
    formId: config.formId,
    formTitle: config.formTitle,
    fields: config.fields,
    submissions: config.submissions,
    totalCount: config.totalCount,
    page: config.page,
    rowsPerPage: config.rowsPerPage,
    onExport: config.onExport,
    onSearch: config.onSearch,
  })
}

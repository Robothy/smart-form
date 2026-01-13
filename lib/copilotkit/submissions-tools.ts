'use client'

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import type { FieldDefinition, Submission } from '@/components/forms/submissions/SubmissionGrid'

export interface SubmissionsToolsConfig {
  formTitle: string
  totalCount: number
  fields: FieldDefinition[]
  submissions: Submission[]
  currentPage: number
  rowsPerPage: number
  onPageChange: (page: number) => void
}

/**
 * Hook that registers tools for viewing form submissions
 * Allows the assistant to browse and analyze submissions
 */
export function useSubmissionsTools(config: SubmissionsToolsConfig) {
  const { formTitle, totalCount, fields, submissions, currentPage, rowsPerPage, onPageChange } = config

  // Share submissions context with the assistant
  useCopilotReadable({
    description: 'Current submissions data including form fields, total count, and visible submissions',
    value: JSON.stringify({
      formTitle,
      totalSubmissions: totalCount,
      fieldCount: fields.length,
      fields: fields.map((f) => ({ label: f.label, type: f.type, required: f.required })),
      currentPage: currentPage + 1,
      rowsPerPage,
      visibleSubmissions: submissions.length,
      submissions: submissions.map((s) => ({
        id: s.id,
        submittedAt: s.submittedAt,
        data: s.data,
      })),
    }),
  })

  // Tool to get submissions summary
  useCopilotAction({
    name: 'getSubmissionsSummary',
    description: 'Get a summary of all submissions including count and pagination info',
    parameters: [],
    handler: async () => {
      return {
        formTitle,
        totalSubmissions: totalCount,
        fieldCount: fields.length,
        currentPage: currentPage + 1,
        rowsPerPage,
        totalPages: Math.ceil(totalCount / rowsPerPage),
        fields: fields.map((f) => ({ label: f.label, type: f.type, required: f.required })),
      }
    },
  })

  // Tool to view details of a specific submission
  useCopilotAction({
    name: 'viewSubmissionDetails',
    description: 'View the details of a specific submission by its index in the current page',
    parameters: [
      {
        name: 'index',
        type: 'number',
        description: 'The index of the submission on the current page (0-based)',
        required: true,
      },
    ],
    handler: async ({ index }) => {
      if (index < 0 || index >= submissions.length) {
        throw new Error(
          `Invalid index. Current page has ${submissions.length} submissions (indices 0-${submissions.length - 1})`
        )
      }

      const submission = submissions[index]
      return {
        id: submission.id,
        submittedAt: submission.submittedAt,
        data: submission.data,
        fields: fields.map((f) => ({
          label: f.label,
          type: f.type,
          value: submission.data[f.id],
        })),
      }
    },
  })

  // Tool to navigate to a specific page
  useCopilotAction({
    name: 'goToPage',
    description: 'Navigate to a specific page of submissions',
    parameters: [
      {
        name: 'pageNumber',
        type: 'number',
        description: 'The page number to navigate to (1-based)',
        required: true,
      },
    ],
    handler: async ({ pageNumber }) => {
      const totalPages = Math.ceil(totalCount / rowsPerPage)
      if (pageNumber < 1 || pageNumber > totalPages) {
        throw new Error(`Invalid page number. Valid pages are 1-${totalPages}`)
      }

      onPageChange(pageNumber - 1)
      return { success: true, page: pageNumber }
    },
  })
}

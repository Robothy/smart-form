'use client'

import { toolRegistry, type ToolContext, type ToolGroupDefinition } from '../tools-registry'

/**
 * Submissions Viewing Tools Definition
 *
 * These tools are available on the submissions page and allow
 * the AI assistant to browse and analyze submissions.
 */

const submissionsViewingTools: ToolGroupDefinition = {
  name: 'submissions-viewing',
  description: 'Tools for viewing form submissions on the submissions page',
  tools: [
    {
      name: 'getSubmissionsSummary',
      description: 'Get a summary of all submissions including count and pagination info',
      parameters: [],
      handler: async (_args, context) => {
        const formTitle = context.getState('submissionsFormTitle') || ''
        const totalCount = context.getState('submissionsTotalCount') || 0
        const fields = context.getState('submissionsFields') || []
        const currentPage = context.getState('submissionsCurrentPage') || 0
        const rowsPerPage = context.getState('submissionsRowsPerPage') || 10

        return {
          formTitle,
          totalSubmissions: totalCount,
          fieldCount: fields.length,
          currentPage: currentPage + 1,
          rowsPerPage,
          totalPages: Math.ceil(totalCount / rowsPerPage),
          fields: fields.map((f: any) => ({ label: f.label, type: f.type, required: f.required })),
        }
      },
    },
    {
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
      handler: async ({ index }, context) => {
        const submissions = context.getState('submissionsData') || []
        const fields = context.getState('submissionsFields') || []

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
          fields: fields.map((f: any) => ({
            label: f.label,
            type: f.type,
            value: submission.data[f.id],
          })),
        }
      },
    },
    {
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
      handler: async ({ pageNumber }, context) => {
        const totalCount = context.getState('submissionsTotalCount') || 0
        const rowsPerPage = context.getState('submissionsRowsPerPage') || 10
        const onPageChange = context.getState('onSubmissionsPageChange')

        if (!onPageChange) {
          throw new Error('Page change handler not available')
        }

        const totalPages = Math.ceil(totalCount / rowsPerPage)
        if (pageNumber < 1 || pageNumber > totalPages) {
          throw new Error(`Invalid page number. Valid pages are 1-${totalPages}`)
        }

        onPageChange(pageNumber - 1)
        return { success: true, page: pageNumber }
      },
    },
  ],
  readableDescriptions: [
    {
      description: 'Current submissions data including form fields, total count, and visible submissions',
      getValue: (context) => {
        const formTitle = context.getState('submissionsFormTitle') || ''
        const totalCount = context.getState('submissionsTotalCount') || 0
        const fields = context.getState('submissionsFields') || []
        const currentPage = context.getState('submissionsCurrentPage') || 0
        const rowsPerPage = context.getState('submissionsRowsPerPage') || 10
        const submissions = context.getState('submissionsData') || []

        return JSON.stringify({
          formTitle,
          totalSubmissions: totalCount,
          fieldCount: fields.length,
          fields: fields.map((f: any) => ({ label: f.label, type: f.type, required: f.required })),
          currentPage: currentPage + 1,
          rowsPerPage,
          visibleSubmissions: submissions.length,
          submissions: submissions.map((s: any) => ({
            id: s.id,
            submittedAt: s.submittedAt,
            data: s.data,
          })),
        })
      },
    },
  ],
}

// Register the submissions viewing tools
toolRegistry.register(submissionsViewingTools)

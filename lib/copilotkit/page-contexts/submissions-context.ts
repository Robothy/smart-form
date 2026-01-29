'use client'

import { useRef, useEffect } from 'react'
import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import { useRouter } from 'next/navigation'

export interface FieldDefinition {
  id: string
  label: string
  type: string
  required: boolean
}

export interface Submission {
  id: string
  data: Record<string, unknown>
  submittedAt: string
}

export interface SubmissionsContextConfig {
  formId: string
  formTitle: string
  fields: FieldDefinition[]
  submissions: Submission[]
  totalCount: number
  page: number
  rowsPerPage: number
  onExport?: (format: string) => Promise<void>
  onSearch?: (query: string) => void
}

/**
 * Hook that registers AI tools for the submissions page
 * Provides capabilities for viewing, analyzing, and exporting submissions
 */
export function useSubmissionsContext(config: SubmissionsContextConfig) {
  const {
    formId,
    formTitle,
    fields,
    submissions,
    totalCount,
    page,
    rowsPerPage,
    onExport,
    onSearch,
  } = config
  const router = useRouter()

  // Use refs for mutable state
  const submissionsRef = useRef(submissions)
  const fieldsRef = useRef(fields)
  const totalCountRef = useRef(totalCount)

  useEffect(() => {
    submissionsRef.current = submissions
  }, [submissions])

  useEffect(() => {
    fieldsRef.current = fields
  }, [fields])

  useEffect(() => {
    totalCountRef.current = totalCount
  }, [totalCount])

  // Share submissions state with AI
  useCopilotReadable({
    description: 'Current submissions page data including form info and all submission data',
    value: JSON.stringify({
      formId,
      formTitle,
      fields: fieldsRef.current.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        required: f.required,
      })),
      submissionsCount: submissionsRef.current.length,
      totalCount: totalCountRef.current,
      currentPage: page + 1,
      rowsPerPage,
      submissions: submissionsRef.current.map((s) => ({
        id: s.id,
        submittedAt: s.submittedAt,
        data: s.data,
      })),
    }),
  })

  // Tool: Get submissions summary
  useFrontendTool({
    name: 'getSubmissionsSummary',
    description: 'Get a summary of all submissions including count, date range, and key stats',
    parameters: [],
    handler: async () => {
      const currentSubmissions = submissionsRef.current

      if (currentSubmissions.length === 0) {
        return {
          formTitle,
          totalCount: totalCountRef.current,
          message: 'No submissions yet',
        }
      }

      const dates = currentSubmissions.map((s) => new Date(s.submittedAt)).sort((a, b) => a.getTime() - b.getTime())
      const earliest = dates[0]
      const latest = dates[dates.length - 1]

      return {
        formTitle,
        totalCount: totalCountRef.current,
        currentPageCount: currentSubmissions.length,
        dateRange: {
          earliest: earliest.toISOString(),
          latest: latest.toISOString(),
        },
        fieldsCount: fieldsRef.current.length,
      }
    },
  })

  // Tool: Search submissions
  useFrontendTool({
    name: 'searchSubmissions',
    description: 'Search submissions for specific values in the response data',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'The search query to find in submission data',
        required: true,
      },
    ],
    handler: async (args) => {
      const { query } = args as { query: string }
      const searchQuery = query.toLowerCase()
      const matchingSubmissions: Array<{
        id: string
        submittedAt: string
        matchingFields: string[]
      }> = []

      for (const submission of submissionsRef.current) {
        const matchingFields: string[] = []
        for (const [key, value] of Object.entries(submission.data)) {
          if (
            typeof value === 'string' &&
            value.toLowerCase().includes(searchQuery)
          ) {
            const field = fieldsRef.current.find((f) => f.id === key)
            matchingFields.push(field?.label || key)
          }
        }

        if (matchingFields.length > 0) {
          matchingSubmissions.push({
            id: submission.id,
            submittedAt: submission.submittedAt,
            matchingFields,
          })
        }
      }

      return {
        query,
        matchCount: matchingSubmissions.length,
        matches: matchingSubmissions,
      }
    },
  })

  // Tool: Export submissions
  if (onExport) {
    useFrontendTool({
      name: 'exportSubmissions',
      description: 'Export all submissions to a file (CSV or JSON)',
      parameters: [
        {
          name: 'format',
          type: 'string',
          description: 'Export format: "csv" or "json"',
          required: true,
        },
      ],
      handler: async (args) => {
        const { format } = args as { format: string }

        if (!['csv', 'json'].includes(format)) {
          throw new Error('Invalid format. Must be "csv" or "json"')
        }

        await onExport(format)
        return `Exporting ${totalCountRef.current} submissions as ${format.toUpperCase()}`
      },
    })
  }

  // Tool: Analyze responses
  useFrontendTool({
    name: 'analyzeResponses',
    description: 'Analyze submission responses to find patterns, common values, and insights',
    parameters: [
      {
        name: 'fieldLabel',
        type: 'string',
        description: 'Optional: specific field label to analyze (if not provided, analyzes all fields)',
        required: false,
      },
    ],
    handler: async (args) => {
      const { fieldLabel } = args as { fieldLabel?: string }

      if (submissionsRef.current.length === 0) {
        return { message: 'No submissions to analyze' }
      }

      const analyses: Array<{
        field: string
        type: string
        responseCount: number
        commonValues?: Array<{ value: string; count: number }>
      }> = []

      const fieldsToAnalyze = fieldLabel
        ? fieldsRef.current.filter((f) => f.label === fieldLabel)
        : fieldsRef.current

      if (fieldsToAnalyze.length === 0) {
        throw new Error(`Field "${fieldLabel}" not found`)
      }

      for (const field of fieldsToAnalyze) {
        const valueCount: Record<string, number> = {}

        for (const submission of submissionsRef.current) {
          const value = submission.data[field.id]
          if (value !== null && value !== undefined && value !== '') {
            const strValue = String(value)
            valueCount[strValue] = (valueCount[strValue] || 0) + 1
          }
        }

        const commonValues = Object.entries(valueCount)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        analyses.push({
          field: field.label,
          type: field.type,
          responseCount: Object.keys(valueCount).length,
          commonValues: commonValues.length > 0 ? commonValues : undefined,
        })
      }

      return {
        formTitle,
        totalSubmissions: submissionsRef.current.length,
        fieldsAnalyzed: analyses.length,
        analyses,
      }
    },
  })

  // Tool: View submission details
  useFrontendTool({
    name: 'viewSubmission',
    description: 'Get detailed data for a specific submission by index',
    parameters: [
      {
        name: 'index',
        type: 'number',
        description: 'The index of the submission on the current page (0-based)',
        required: true,
      },
    ],
    handler: async (args) => {
      const { index } = args as { index: number }

      if (index < 0 || index >= submissionsRef.current.length) {
        throw new Error(
          `Invalid index: ${index}. Current page has ${submissionsRef.current.length} submissions`
        )
      }

      const submission = submissionsRef.current[index]

      const fieldValues = fieldsRef.current.map((f) => ({
        field: f.label,
        type: f.type,
        value: submission.data[f.id] ?? null,
      }))

      return {
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
        values: fieldValues,
      }
    },
  })

  // Tool: Navigate back to form view
  useFrontendTool({
    name: 'goToFormView',
    description: 'Navigate back to the form view page',
    parameters: [],
    handler: async () => {
      router.push(`/forms/${formId}/view`)
      return `Navigating to view "${formTitle}"`
    },
  })

  // Tool: Get field statistics
  useFrontendTool({
    name: 'getFieldStatistics',
    description: 'Get statistics for all form fields (response rate, field type, etc.)',
    parameters: [],
    handler: async () => {
      const currentSubmissions = submissionsRef.current

      return {
        formTitle,
        totalSubmissions: currentSubmissions.length,
        fields: fieldsRef.current.map((f) => {
          let responseCount = 0
          let emptyCount = 0

          for (const submission of currentSubmissions) {
            const value = submission.data[f.id]
            if (value !== null && value !== undefined && value !== '') {
              responseCount++
            } else {
              emptyCount++
            }
          }

          return {
            label: f.label,
            type: f.type,
            required: f.required,
            responseCount,
            emptyCount,
            responseRate:
              currentSubmissions.length > 0
                ? `${Math.round((responseCount / currentSubmissions.length) * 100)}%`
                : 'N/A',
          }
        }),
      }
    },
  })
}

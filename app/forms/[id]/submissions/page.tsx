'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Container,
  Button,
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { SubmissionGrid, type FieldDefinition, type Submission } from '@/components/forms/submissions/SubmissionGrid'
import { PageToolbar } from '@/components/forms/list/PageToolbar'
import Link from 'next/link'
import { buttonStyles } from '@/theme'
import { usePageAiTools } from './ai-tools'

interface ApiField {
  id: string
  label: string
  type: string
  required: number | boolean
}

interface ApiSubmission {
  id: string
  data: Record<string, unknown>
  submittedAt: string
}

/**
 * Form submissions page - view all submissions for a published form
 */
export default function SubmissionsPage() {
  const params = useParams()
  const formId = params.id as string

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [formTitle, setFormTitle] = useState<string>('Form')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Load form fields once on mount
  useEffect(() => {
    const abortController = new AbortController()

    const loadFormFields = async () => {
      try {
        const formResponse = await fetch(`/api/forms/${formId}`, { signal: abortController.signal })
        if (!formResponse.ok) {
          throw new Error('Form not found')
        }
        const formResult = await formResponse.json()
        if (formResult.success) {
          const fieldData: FieldDefinition[] = (formResult.data.fields || []).map((f: ApiField) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            required: f.required === 1 || f.required === true,
          }))
          setFields(fieldData)
          setFormTitle(formResult.data.title || 'Form')
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to load form')
        }
      }
    }

    loadFormFields()

    return () => {
      abortController.abort()
    }
  }, [formId])

  // Load submissions when page or rowsPerPage changes
  useEffect(() => {
    const abortController = new AbortController()

    const loadSubmissions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const submissionsResponse = await fetch(
          `/api/forms/${formId}/submissions?page=${page + 1}&limit=${rowsPerPage}`,
          { signal: abortController.signal }
        )
        if (!submissionsResponse.ok) {
          throw new Error('Failed to load submissions')
        }

        const submissionsResult = await submissionsResponse.json()
        if (submissionsResult.success) {
          const subData: Submission[] = (submissionsResult.data.submissions || []).map((s: ApiSubmission) => ({
            id: s.id,
            data: s.data,
            submittedAt: s.submittedAt,
          }))
          setSubmissions(subData)
          setTotalCount(submissionsResult.data.pagination?.total || 0)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to load submissions')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissions()

    return () => {
      abortController.abort()
    }
  }, [formId, page, rowsPerPage])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  // Register AI tools for this page (unconditionally, but only meaningful when data is loaded)
  usePageAiTools({
    formId,
    formTitle,
    fields,
    submissions: submissions.map((s) => ({
      ...s,
      submittedAt: s.submittedAt == null ? null : (typeof s.submittedAt === 'string' ? s.submittedAt : s.submittedAt.toISOString()),
    })),
    totalCount,
    page,
    rowsPerPage,
  })

  return (
    <>
      <PageToolbar
        title="Submissions"
        subtitle={`${totalCount} submission${totalCount !== 1 ? 's' : ''} • ${formTitle}`}
        actions={
          <Link href={`/forms/${formId}/view`} style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ ...buttonStyles.ghost, borderRadius: 999, px: 2.5, fontSize: '0.875rem' }}
            >
              Back to Form
            </Button>
          </Link>
        }
      />

      <Container maxWidth="lg" sx={{ py: 4, mt: 10 }}>
        {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 2,
            color: '#ef4444',
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <SubmissionGrid
        fields={fields}
        submissions={submissions}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      </Container>
    </>
  )
}

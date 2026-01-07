'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material'
import { SubmissionGrid, type FieldDefinition, type Submission } from '@/components/forms/SubmissionGrid'
import Link from 'next/link'
import { flexStyles } from '@/theme'

/**
 * Form submissions page - view all submissions for a published form
 */
export default function SubmissionsPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [fields, setFields] = useState<FieldDefinition[]>([])
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
          const fieldData: FieldDefinition[] = (formResult.data.fields || []).map((f: any) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            required: f.required === 1 || f.required === true,
          }))
          setFields(fieldData)
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
          const subData: Submission[] = (submissionsResult.data.submissions || []).map((s: any) => ({
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          ...flexStyles.between,
        }}
      >
        <Typography variant="h4" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
          Submissions
        </Typography>
        <Box sx={{ ...flexStyles.gap.sm }}>
          <Link href={`/forms/${formId}/view`}>
            <Button
              variant="outlined"
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f1f5f9',
                background: 'rgba(255, 255, 255, 0.02)',
                fontWeight: 600,
                '&:hover': {
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              Back to Form
            </Button>
          </Link>
          <Link href="/forms">
            <Button
              variant="outlined"
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f1f5f9',
                background: 'rgba(255, 255, 255, 0.02)',
                fontWeight: 600,
                '&:hover': {
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              All Forms
            </Button>
          </Link>
        </Box>
      </Box>

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
  )
}

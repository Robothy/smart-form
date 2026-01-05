'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material'
import { SubmissionList, type PaginationData } from '@/components/ui/SubmissionList'
import type { FormFieldData } from '@/components/ui/FormBuilder'

type Submission = {
  id: string
  data: Record<string, string | string[]>
  submittedAt: string
}

/**
 * Form submissions page - view all submissions for a published form
 */
export default function SubmissionsPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [fields, setFields] = useState<FormFieldData[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadSubmissions()
  }, [formId, currentPage])

  const loadSubmissions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load form fields first
      const formResponse = await fetch(`/api/forms/${formId}`)
      if (!formResponse.ok) {
        throw new Error('Form not found')
      }
      const formResult = await formResponse.json()
      if (formResult.success) {
        setFields(formResult.data.fields || [])
      }

      // Load submissions
      const submissionsResponse = await fetch(`/api/forms/${formId}/submissions?page=${currentPage}&limit=20`)
      if (!submissionsResponse.ok) {
        throw new Error('Failed to load submissions')
      }

      const submissionsResult = await submissionsResponse.json()
      if (submissionsResult.success) {
        setSubmissions(submissionsResult.data.submissions)
        setPagination(submissionsResult.data.pagination)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading submissions...</Typography>
      </Container>
    )
  }

  if (error && submissions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => router.push(`/forms/${formId}/view`)}>
            Back to Form
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Submissions</Typography>
        <Button variant="outlined" onClick={() => router.push(`/forms/${formId}/view`)}>
          Back to Form
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        {pagination && (
          <SubmissionList
            submissions={submissions}
            pagination={pagination}
            fields={fields}
            onPageChange={handlePageChange}
          />
        )}
      </Paper>
    </Container>
  )
}

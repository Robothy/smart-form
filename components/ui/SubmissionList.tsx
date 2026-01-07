'use client'

import { Box, Typography, Card, CardContent, Chip, Button, Stack, Alert } from '@mui/material'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material'

export interface SubmissionData {
  id: string
  data: Record<string, string | string[]>
  submittedAt: string
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SubmissionListProps {
  submissions: SubmissionData[]
  pagination: PaginationData
  fields: Array<{ id: string; label: string; type: string }>
  onPageChange: (page: number) => void
}

export function SubmissionList({
  submissions,
  pagination,
  fields,
  onPageChange,
}: SubmissionListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatValue = (value: string | string[], fieldType: string) => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return value
  }

  if (submissions.length === 0) {
    return (
      <Alert severity="info">
        No submissions received yet. Share your form to start collecting responses.
      </Alert>
    )
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6">
        {pagination.total} submission{pagination.total !== 1 ? 's' : ''} received
      </Typography>

      <Stack spacing={2}>
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Submitted: {formatDate(submission.submittedAt)}
                </Typography>
                <Chip label={`ID: ${submission.id.slice(0, 8)}...`} size="small" />
              </Box>

              <Stack spacing={1.5}>
                {fields.map((field) => {
                  const value = submission.data[field.id]
                  return (
                    <Box key={field.id}>
                      <Typography variant="caption" color="text.secondary">
                        {field.label}
                      </Typography>
                      <Typography variant="body1">
                        {value ? formatValue(value, field.type) : <em>(empty)</em>}
                      </Typography>
                    </Box>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<KeyboardArrowLeft />}
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>

          <Typography variant="body2">
            Page {pagination.page} of {pagination.totalPages}
          </Typography>

          <Button
            endIcon={<KeyboardArrowRight />}
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </Box>
      )}
    </Stack>
  )
}

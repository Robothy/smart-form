'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Tooltip,
  IconButton,
  TablePagination,
  CircularProgress,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

export interface FieldDefinition {
  id: string
  label: string
  type: string
  required: boolean
}

export interface Submission {
  id: string
  data: Record<string, string | string[]>
  submittedAt: string | Date
}

interface SubmissionGridProps {
  fields: FieldDefinition[]
  submissions: Submission[]
  isLoading?: boolean
  page?: number
  rowsPerPage?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
}

/**
 * Display submissions in a grid/table format with columns for each field
 * Supports horizontal and vertical scrolling, truncation with tooltip
 */
export function SubmissionGrid({
  fields,
  submissions,
  isLoading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = submissions.length,
  onPageChange,
  onRowsPerPageChange,
}: SubmissionGridProps) {
  // Truncate long text with tooltip
  const truncateText = (text: string | string[] | undefined | null, maxLength = 50): string => {
    if (!text) return '-'
    const str = Array.isArray(text) ? text.join(', ') : String(text)
    if (str.length <= maxLength) return str
    return `${str.substring(0, maxLength)}...`
  }

  const handleCopy = async (text: string | string[] | undefined | null) => {
    if (!text) return
    const str = Array.isArray(text) ? text.join(', ') : String(text)
    await navigator.clipboard.writeText(str)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (submissions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No submissions yet.
        </Typography>
      </Paper>
    )
  }

  // Calculate pagination
  const displaySubmissions = onPageChange
    ? submissions.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    : submissions

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
              {fields.map((field) => (
                <TableCell key={field.id} sx={{ fontWeight: 'bold', minWidth: 150 }}>
                  {field.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displaySubmissions.map((submission) => (
              <TableRow key={submission.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {submission.submittedAt instanceof Date
                    ? submission.submittedAt.toLocaleDateString()
                    : new Date(submission.submittedAt).toLocaleDateString()}
                </TableCell>
                {fields.map((field) => {
                  const value = submission.data[field.id]
                  const displayValue = truncateText(value)
                  return (
                    <TableCell key={field.id}>
                      <Tooltip
                        title={value ? String(value) : '-'}
                        arrow
                        enterDelay={500}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span>{displayValue}</span>
                          {value && String(value).length > 20 && (
                            <Tooltip title="Copy value">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopy(value)
                                }}
                                sx={{ flexShrink: 0, width: 20, height: 20 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value, 10)
            onRowsPerPageChange?.(newRowsPerPage)
            onPageChange?.(0)
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </Paper>
  )
}

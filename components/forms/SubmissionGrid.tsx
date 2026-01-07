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
import { layoutStyles, flexStyles } from '@/theme'

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
      <Box sx={flexStyles.center} style={{ py: 8 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    )
  }

  if (submissions.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'rgba(26, 26, 36, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
        }}
      >
        <Typography sx={{ color: '#94a3b8' }}>No submissions yet.</Typography>
      </Paper>
    )
  }

  // Calculate pagination
  const displaySubmissions = onPageChange
    ? submissions.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    : submissions

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        ...layoutStyles.glassSurface,
        borderRadius: 2,
      }}
    >
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead
            sx={{
              '& .MuiTableCell-root': {
                background: 'rgba(19, 19, 26, 0.95)',
                color: '#f1f5f9',
                fontWeight: 700,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <TableRow>
              <TableCell>Submitted</TableCell>
              {fields.map((field) => (
                <TableCell key={field.id} sx={{ minWidth: 150 }}>
                  {field.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& .MuiTableCell-root': {
                color: '#f1f5f9',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              },
              '& .MuiTableRow-hover:hover': {
                background: 'rgba(99, 102, 241, 0.05)',
              },
            }}
          >
            {displaySubmissions.map((submission) => (
              <TableRow key={submission.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
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
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            background: 'rgba(19, 19, 26, 0.95)',
                            color: '#f1f5f9',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          },
                        }}
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
                            color: '#f1f5f9',
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
                                sx={{
                                  flexShrink: 0,
                                  width: 20,
                                  height: 20,
                                  color: '#64748b',
                                  '&:hover': {
                                    color: '#6366f1',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                  },
                                }}
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
          sx={{
            color: '#94a3b8',
            '& .MuiTablePagination-select': {
              color: '#f1f5f9',
            },
            '& .MuiTablePagination-selectIcon': {
              color: '#94a3b8',
            },
            '& .MuiTablePagination-actions': {
              color: '#94a3b8',
            },
          }}
        />
      )}
    </Paper>
  )
}

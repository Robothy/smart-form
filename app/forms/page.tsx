'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { FormCard } from '@/components/forms/FormCard'
import Link from 'next/link'
import { layoutStyles, flexStyles, buttonStyles } from '@/theme'

type Form = {
  id: string
  title: string
  status: 'draft' | 'published'
  description?: string
  fieldsCount: number
  submissionsCount: number
  shareableLink?: string
  slug?: string | null
}

type StatusFilter = 'all' | 'draft' | 'published'

type FormsCount = {
  all: number
  draft: number
  published: number
}

/**
 * Forms list page - displays all forms with filtering
 */
export default function FormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [counts, setCounts] = useState<FormsCount>({ all: 0, draft: 0, published: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const abortController = new AbortController()
    loadForms(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [filter])

  const loadForms = async (signal: AbortSignal) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = filter === 'all' ? '/api/forms' : `/api/forms?status=${filter}`
      const response = await fetch(url, { signal })

      if (!response.ok) {
        throw new Error('Failed to load forms')
      }

      const result = await response.json()
      if (result.success) {
        setForms(result.data.forms)
        setCounts(result.data.counts)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormClick = (form: Form) => {
    if (form.status === 'published') {
      router.push(`/forms/${form.id}/view`)
    } else {
      router.push(`/forms/${form.id}/edit`)
    }
  }

  return (
    <>
      {/* Toolbar */}
      <Box
        sx={(theme) => ({
          position: 'fixed',
          top: { xs: 56, sm: 64 },
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar - 1,
          ...layoutStyles.glassToolbar,
        })}
      >
        <Box
          sx={{
            maxWidth: 1200,
            margin: '0 auto',
            ...flexStyles.between,
            gap: 2,
            py: 1.5,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              fontSize="1.125rem"
              letterSpacing="-0.02em"
              noWrap
              sx={{ color: '#f1f5f9' }}
            >
              My Forms
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
              noWrap
            >
              {counts.all} form{counts.all !== 1 ? 's' : ''} total
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Link href="/forms/new" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 999,
                  fontSize: '0.875rem',
                  ...buttonStyles.primary,
                }}
              >
                Create New Form
              </Button>
            </Link>
          </Stack>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, mt: 18 }}>
      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, value) => value && setFilter(value)}
          aria-label="form status filter"
          sx={{
            '& .MuiToggleButton-root': {
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 1,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              },
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#f1f5f9',
              },
            },
          }}
        >
          <ToggleButton value="all" aria-label="all forms">
            All <Chip label={counts.all} size="small" sx={{ ml: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }} />
          </ToggleButton>
          <ToggleButton value="draft" aria-label="draft forms">
            Drafts <Chip label={counts.draft} size="small" sx={{ ml: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }} />
          </ToggleButton>
          <ToggleButton value="published" aria-label="published forms">
            Published <Chip label={counts.published} size="small" sx={{ ml: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }} />
          </ToggleButton>
        </ToggleButtonGroup>
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

      {isLoading ? (
        <Box sx={{ ...flexStyles.center, py: 8 }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
      ) : forms.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 2,
            color: '#3b82f6',
          }}
        >
          {filter === 'all'
            ? 'No forms yet. Create your first form to get started!'
            : `No ${filter} forms found.`}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <FormCard
                id={form.id}
                title={form.title}
                status={form.status}
                description={form.description}
                fieldsCount={form.fieldsCount}
                submissionsCount={form.submissionsCount}
                shareableLink={form.shareableLink}
                slug={form.slug}
                onClick={() => handleFormClick(form)}
                onDeleted={() => loadForms(new AbortController().signal)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
    </>
  )
}

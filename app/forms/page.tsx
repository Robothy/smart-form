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
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(6px)',
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        })}
      >
        <Box
          sx={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1.25,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              My Forms
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {counts.all} form{counts.all !== 1 ? 's' : ''} total
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Link href="/forms/new" passHref legacyBehavior>
              <Button
                component="a"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 999, px: 3 }}
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
        >
          <ToggleButton value="all" aria-label="all forms">
            All <Chip label={counts.all} size="small" sx={{ ml: 1 }} />
          </ToggleButton>
          <ToggleButton value="draft" aria-label="draft forms">
            Drafts <Chip label={counts.draft} size="small" sx={{ ml: 1 }} />
          </ToggleButton>
          <ToggleButton value="published" aria-label="published forms">
            Published <Chip label={counts.published} size="small" sx={{ ml: 1 }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : forms.length === 0 ? (
        <Alert severity="info">
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

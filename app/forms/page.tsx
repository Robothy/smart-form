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
} from '@mui/material'
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

/**
 * Forms list page - displays all forms with filtering
 */
export default function FormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    loadForms()
  }, [filter])

  const loadForms = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = filter === 'all' ? '/api/forms' : `/api/forms?status=${filter}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to load forms')
      }

      const result = await response.json()
      if (result.success) {
        setForms(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forms')
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">My Forms</Typography>
        <Link href="/forms/new">
          <Button variant="contained">Create New Form</Button>
        </Link>
      </Box>

      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, value) => value && setFilter(value)}
          aria-label="form status filter"
        >
          <ToggleButton value="all" aria-label="all forms">
            All <Chip label={forms.length} size="small" sx={{ ml: 1 }} />
          </ToggleButton>
          <ToggleButton value="draft" aria-label="draft forms">
            Drafts <Chip label={forms.filter(f => f.status === 'draft').length} size="small" sx={{ ml: 1 }} />
          </ToggleButton>
          <ToggleButton value="published" aria-label="published forms">
            Published <Chip label={forms.filter(f => f.status === 'published').length} size="small" sx={{ ml: 1 }} />
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
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

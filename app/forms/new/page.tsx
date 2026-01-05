'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material'
import { FormBuilder, type FormData } from '@/components/ui/FormBuilder'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

/**
 * Form creation page - create a new form with fields
 */
export default function NewFormPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    status: 'draft',
    fields: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSave = async (data: Omit<FormData, 'id' | 'status'>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create form')
      }

      const result = await response.json()
      if (result.success) {
        setIsSuccess(true)
        // Redirect to edit page after short delay
        setTimeout(() => {
          router.push(`/forms/${result.data.id}/edit`)
        }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = (updated: FormData) => {
    setForm(updated)
  }

  if (isSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 4 }}>
          Form created successfully! Redirecting to edit page...
        </Alert>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Create New Form</Typography>
        <Link href="/forms">
          <Button variant="outlined">Back to Forms</Button>
        </Link>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FormBuilder
        form={form}
        onSave={handleSave}
        onUpdate={handleUpdate}
      />
    </Container>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { FormFiller, type FormData } from '@/components/forms/fill'
import { useParams, useSearchParams } from 'next/navigation'
import { Container, Box, Button } from '@mui/material'
import Link from 'next/link'
import { buttonStyles } from '@/theme'
import { useFillFormTools } from '@/lib/copilotkit'

/**
 * Form fill page - allows users to fill out a published form
 */
export default function FillFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const formId = params.id as string
  const slug = searchParams.get('slug') || undefined

  const [form, setForm] = useState<FormData | null>(null)
  const [values, setValues] = useState<Record<string, string | string[]>>({})

  // Load form data
  useEffect(() => {
    const loadFormForContext = async () => {
      try {
        const url = slug ? `/api/forms/share/${slug}` : `/api/forms/${formId}`
        const response = await fetch(url)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setForm(result.data)
          }
        }
      } catch (err) {
        console.error('Failed to load form:', err)
      }
    }

    loadFormForContext()
  }, [formId, slug])

  // Register fill form tools
  useFillFormTools({
    form,
    values,
    onSetValue: (fieldId, value) => {
      setValues((prev) => ({ ...prev, [fieldId]: value }))
    },
    onSetMultipleValues: (updates) => {
      setValues((prev) => ({ ...prev, ...updates }))
    },
    onClearValue: (fieldId) => {
      setValues((prev) => {
        const newValues = { ...prev }
        delete newValues[fieldId]
        return newValues
      })
    },
  })

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Link href="/">
          <Button variant="outlined" size="small" sx={buttonStyles.ghost}>
            Back to Home
          </Button>
        </Link>
      </Box>
      <FormFiller formId={formId} slug={slug} externalValues={values} onValuesChange={setValues} />
    </Container>
  )
}

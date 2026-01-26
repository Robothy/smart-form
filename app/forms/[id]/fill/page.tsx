'use client'

import { FormFiller } from '@/components/forms/fill'
import { useParams, useSearchParams } from 'next/navigation'
import { Container, Box, Button } from '@mui/material'
import Link from 'next/link'
import { buttonStyles } from '@/theme'

/**
 * Form fill page - allows users to fill out a published form
 */
export default function FillFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const formId = params.id as string
  const slug = searchParams.get('slug') || undefined

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Link href="/">
          <Button variant="outlined" size="small" sx={buttonStyles.ghost}>
            Back to Home
          </Button>
        </Link>
      </Box>
      <FormFiller formId={formId} slug={slug} />
    </Container>
  )
}

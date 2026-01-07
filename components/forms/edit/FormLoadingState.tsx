import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { FormData } from '@/components/ui/FormBuilder'

export interface FormLoadingStateProps {
  isLoading: boolean
  error: string | null
  form: FormData | null
}

export function FormLoadingState({ isLoading, error, form }: FormLoadingStateProps) {
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading form...</Typography>
      </Container>
    )
  }

  if (error && !form) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Link href="/forms">
            <Button variant="outlined">Back to Forms</Button>
          </Link>
        </Box>
      </Container>
    )
  }

  if (!form) {
    return null
  }

  return null
}

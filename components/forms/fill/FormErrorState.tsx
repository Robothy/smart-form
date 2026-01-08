'use client'

import { Container, Alert, Button } from '@mui/material'
import { buttonStyles } from '@/theme'

export interface FormErrorStateProps {
  error: string
  onGoBack: () => void
}

export function FormErrorState({ error, onGoBack }: FormErrorStateProps) {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Alert
        severity="error"
        sx={{
          mb: 2,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 2,
          color: '#ef4444',
        }}
      >
        {error}
      </Alert>
      <Button
        variant="outlined"
        onClick={onGoBack}
        sx={buttonStyles.ghost}
      >
        Go Back
      </Button>
    </Container>
  )
}

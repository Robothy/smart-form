'use client'

import { Container, Alert, Button, Box } from '@mui/material'
import { buttonStyles, flexStyles } from '@/theme'

export interface FormSuccessStateProps {
  onSubmitAnother: () => void
  onReturnHome: () => void
}

export function FormSuccessState({ onSubmitAnother, onReturnHome }: FormSuccessStateProps) {
  return (
    <Container maxWidth="md" sx={{ py: 8, ...flexStyles.center, flexDirection: 'column' }}>
      <Alert
        severity="success"
        sx={{
          mb: 4,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 2,
          color: '#10b981',
        }}
      >
        Thank you! Your form has been submitted successfully.
      </Alert>
      <Box sx={{ ...flexStyles.gap.sm, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={onSubmitAnother}
          sx={buttonStyles.primary}
        >
          Submit Another Response
        </Button>
        <Button
          variant="outlined"
          onClick={onReturnHome}
          sx={buttonStyles.ghost}
        >
          Return Home
        </Button>
      </Box>
    </Container>
  )
}

'use client'

import { Container, CircularProgress, Typography } from '@mui/material'
import { flexStyles } from '@/theme'

export function FormLoadingState() {
  return (
    <Container maxWidth="md" sx={{ py: 8, ...flexStyles.center, flexDirection: 'column' }}>
      <CircularProgress sx={{ color: '#6366f1' }} />
      <Typography sx={{ mt: 2, color: '#94a3b8' }}>Loading form...</Typography>
    </Container>
  )
}

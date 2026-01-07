import { Snackbar } from '@mui/material'

export interface SuccessSnackbarProps {
  open: boolean
  onClose: () => void
  message?: string
}

export function SuccessSnackbar({ open, onClose, message = 'Form updated successfully!' }: SuccessSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={onClose}
      message={message}
      sx={{
        '& .MuiSnackbarContent-root': {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
          color: '#ffffff',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    />
  )
}

'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material'
import { buttonStyles } from '@/theme'

interface DeleteConfirmationDialogProps {
  open: boolean
  formTitle: string
  submissionsCount: number
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

/**
 * Confirmation dialog for deleting a form
 * Shows form name and submission count for context
 */
export function DeleteConfirmationDialog({
  open,
  formTitle,
  submissionsCount,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="delete-dialog-title">
      <DialogTitle id="delete-dialog-title">Delete Form?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>"{formTitle}"</strong>?
          This will permanently remove the form, all {submissionsCount} field{submissionsCount !== 1 ? 's' : ''},
          and {submissionsCount} submission{submissionsCount !== 1 ? 's' : ''}. This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={buttonStyles.danger}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

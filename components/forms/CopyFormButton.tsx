'use client'

import { useState } from 'react'
import { Button as MuiButton, CircularProgress } from '@mui/material'
import { ContentCopy as CopyIcon } from '@mui/icons-material'
import { forwardRef } from 'react'
import { useRouter } from 'next/navigation'

export interface CopyFormButtonProps {
  formId: string
  onCopied?: (newFormId: string) => void
  onError?: (error: string) => void
  disabled?: boolean
  children?: React.ReactNode
}

export interface CopiedFormData {
  id: string
  title: string
  status: 'draft'
  slug: string | null
  fieldCount: number
}

/**
 * MUI-wrapped Copy Form button component
 * Creates an independent copy of a published form as a new draft
 *
 * @example
 * <CopyFormButton
 *   formId="abc123"
 *   onCopied={(newFormId) => console.log('Copied:', newFormId)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 */
export const CopyFormButton = forwardRef<HTMLButtonElement, CopyFormButtonProps>(
  (props, ref) => {
    const { formId, onCopied, onError, disabled: propsDisabled, children, ...rest } = props
    const router = useRouter()
    const [isCopying, setIsCopying] = useState(false)

    const handleClick = async () => {
      setIsCopying(true)

      try {
        const response = await fetch(`/api/forms/${formId}/copy`, {
          method: 'POST',
        })

        const result = await response.json()

        if (result.success) {
          onCopied?.(result.data.id)
          // Redirect to edit the new copy
          router.push(`/forms/${result.data.id}/edit`)
        } else {
          onError?.(result.error || 'Failed to copy form')
        }
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to copy form')
      } finally {
        setIsCopying(false)
      }
    }

    const isDisabled = propsDisabled || isCopying

    return (
      <MuiButton
        ref={ref}
        variant="outlined"
        startIcon={isCopying ? <CircularProgress size={16} /> : <CopyIcon />}
        disabled={isDisabled}
        onClick={handleClick}
        {...rest}
      >
        {isCopying ? 'Copying...' : children || 'Copy Form'}
      </MuiButton>
    )
  }
)

CopyFormButton.displayName = 'CopyFormButton'

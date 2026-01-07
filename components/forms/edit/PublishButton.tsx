'use client'

import { useState } from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material'
import { forwardRef } from 'react'
import { buttonStyles } from '@/theme'

export interface PublishButtonProps {
  formId: string
  fieldCount: number
  onPublished?: (data: PublishedFormData) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export interface PublishedFormData {
  id: string
  title: string
  status: 'published'
  slug: string
  shareUrl: string
  publishedAt: string
  fieldCount: number
}

/**
 * MUI-wrapped Publish button component
 * Displays a publish button that changes form status to published
 *
 * @example
 * <PublishButton
 *   formId="abc123"
 *   fieldCount={5}
 *   onPublished={(data) => console.log('Published:', data.shareUrl)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 */
export const PublishButton = forwardRef<HTMLButtonElement, PublishButtonProps>(
  (props, ref) => {
    const { formId, fieldCount, onPublished, onError, disabled: propsDisabled, ...rest } = props
    const [isPublishing, setIsPublishing] = useState(false)

    const handleClick = async () => {
      // Validate before publishing
      if (fieldCount < 1) {
        onError?.('Add at least one field before publishing')
        return
      }

      setIsPublishing(true)

      try {
        const response = await fetch(`/api/forms/${formId}/publish`, {
          method: 'POST',
        })

        const result = await response.json()

        if (result.success) {
          onPublished?.(result.data)
        } else {
          onError?.(result.error || 'Failed to publish form')
        }
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to publish form')
      } finally {
        setIsPublishing(false)
      }
    }

    // Disable if already disabled, publishing, or no fields
    const isDisabled = propsDisabled || isPublishing || fieldCount < 1

    return (
      <MuiButton
        ref={ref}
        variant="contained"
        disabled={isDisabled}
        onClick={handleClick}
        startIcon={isPublishing ? <CircularProgress size={16} /> : undefined}
        sx={buttonStyles.success}
        {...rest}
      >
        {isPublishing ? 'Publishing...' : 'Publish'}
      </MuiButton>
    )
  }
)

PublishButton.displayName = 'PublishButton'

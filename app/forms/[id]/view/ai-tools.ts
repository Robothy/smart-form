'use client'

import { useFormViewContext } from '@/lib/copilotkit/page-contexts'
import type { FormFieldData } from '@/components/forms/edit/fieldEditors'
import type { FormData } from '@/components/ui/FormBuilder'

/**
 * AI tools for the view form page
 * Registers tools for viewing form details, copying share links, and navigation
 */
export function usePageAiTools(config: {
  form?: FormData
  shareableLink?: string
  onCopyLink?: () => void
  onEdit?: () => void
  onDelete?: () => Promise<void>
}) {
  useFormViewContext({
    form: config.form ? {
      id: config.form.id!,
      title: config.form.title,
      status: config.form.status,
      slug: config.form.slug,
      fields: config.form.fields as FormFieldData[],
    } : undefined,
    shareableLink: config.shareableLink,
    onCopyLink: config.onCopyLink,
    onEdit: config.onEdit,
    onDelete: config.onDelete,
  })
}

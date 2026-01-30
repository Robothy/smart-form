'use client'

import { useFormFillContext } from '@/lib/copilotkit/page-contexts'
import type { FormFieldData } from '@/components/forms/fill/FormFieldRenderer'

/**
 * AI tools for the fill form page
 * Registers tools for filling out form fields and submitting
 */
export function usePageAiTools(config: {
  form?: {
    id: string
    title: string
    fields: FormFieldData[]
  }
  values: Record<string, string>
  errors: Record<string, string>
  onValueChange: (fieldId: string, value: string) => void
  onSubmit: () => Promise<void>
}) {
  useFormFillContext(config)
}

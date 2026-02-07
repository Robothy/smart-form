'use client'

import { useFormEditContext } from '@/lib/copilotkit/page-contexts'
import type { FormFieldData } from '@/components/forms/edit/fieldEditors'
import type { FormData } from '@/components/ui/FormBuilder'

/**
 * AI tools for the edit form page
 * Registers tools for form building, saving, and publishing
 */
export function usePageAiTools(config: {
  form?: FormData
  onUpdate: (form: FormData) => void
  onSave: () => Promise<{ id: string; title: string; status: string; slug?: string | null }>
  onPublish: () => Promise<{ id: string; title: string; status: string; slug?: string | null }>
}) {
  useFormEditContext({
    form: config.form ? {
      id: config.form.id,
      title: config.form.title,
      description: config.form.description,
      fields: config.form.fields as FormFieldData[],
      status: config.form.status,
      slug: config.form.slug,
    } : undefined,
    onUpdateForm: (updates) => {
      const current = config.form
      if (!current) return
      let updated: FormData

      if (typeof updates === 'function') {
        const result = updates({
          title: current.title,
          description: current.description,
          fields: current.fields as FormFieldData[],
        })
        updated = {
          ...current,
          ...(result.title !== undefined && { title: result.title }),
          ...(result.description !== undefined && { description: result.description }),
          ...(result.fields !== undefined && { fields: result.fields }),
        }
      } else {
        updated = {
          ...current,
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.fields !== undefined && { fields: updates.fields }),
        }
      }

      config.onUpdate(updated)
    },
    onSave: config.onSave,
    onPublish: config.onPublish,
  })
}

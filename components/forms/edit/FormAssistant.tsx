'use client'

import { CopilotPopup } from '@copilotkit/react-ui'
import { useCopilotReadable } from '@copilotkit/react-core'
import { useFormTools } from '@/lib/copilotkit/form-tools'
import type { FormData } from '@/components/ui/FormBuilder'

interface FormAssistantProps {
  form: FormData
  onUpdate: (form: FormData) => void
}

/**
 * CopilotPopup assistant for form editing
 * Provides AI-powered form building assistance
 */
export function FormAssistant({ form, onUpdate }: FormAssistantProps) {
  // Share form state with the agent
  useCopilotReadable({
    description: 'Current form state including title, description, and all fields',
    value: JSON.stringify(
      {
        title: form.title,
        description: form.description,
        fields: form.fields.map((f) => ({
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          options: f.options,
        })),
      },
      null,
      2
    ),
  })

  // Register form editing tools
  useFormTools({
    formTitle: form.title,
    formDescription: form.description,
    fields: form.fields,
    onUpdateForm: (updates) => {
      const updated: FormData = {
        ...form,
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.fields !== undefined && { fields: updates.fields }),
      }
      onUpdate(updated)
    },
  })

  return (
    <CopilotPopup
      instructions={`You are a helpful form building assistant. You are currently on the form edit page.

Current form context:
- Form ID: ${form.id || 'new form'}
- Status: ${form.status}
- Share slug: ${form.slug || 'not set'}

Available capabilities:
1. View the current form state (title, description, fields)
2. Update form title and description
3. Add new fields (text, textarea, date, radio, checkbox)
4. Update existing fields (label, placeholder, required status)
5. Remove fields
6. Provide suggestions for form improvements

Guidelines:
- Be concise and helpful
- Ask for clarification when needed
- Suggest field types based on the form's purpose
- Ensure form fields have clear, user-friendly labels
- Warn before removing fields that have content
- Keep field labels short and descriptive`}
      labels={{
        title: 'Form Assistant',
        initial: 'Hi! I can help you build this form. What would you like to create?',
      }}
      defaultOpen={false}
      shortcut="j"
    />
  )
}

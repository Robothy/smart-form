'use client'

import { useRef, useEffect } from 'react'
import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import { useRouter } from 'next/navigation'
import type { FormFieldData } from '@/components/forms/edit/fieldEditors'

export interface FormViewContextConfig {
  form?: {
    id: string
    title: string
    status: string
    slug?: string | null
    fields?: FormFieldData[]
  }
  shareableLink?: string
  onCopyLink?: () => void
  onEdit?: () => void
  onDelete?: () => Promise<void>
}

/**
 * Hook that registers AI tools for the form view page
 * Provides capabilities for viewing form details, copying links, and navigation
 */
export function useFormViewContext(config: FormViewContextConfig) {
  const { form, shareableLink, onCopyLink, onEdit, onDelete } = config
  const router = useRouter()

  // Use a ref to track the latest form state
  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])

  // Share form state with AI
  useCopilotReadable({
    description: 'Current form view including form details, status, and shareable link',
    value: JSON.stringify({
      id: form?.id,
      title: form?.title,
      status: form?.status,
      slug: form?.slug,
      shareableLink: shareableLink || null,
      fieldsCount: form?.fields?.length || 0,
      fields: form?.fields?.map((f) => ({
        type: f.type,
        label: f.label,
        required: f.required,
      })),
    }),
  })

  // Tool: Copy share link
  useFrontendTool({
    name: 'copyShareLink',
    description: 'Copy the shareable link for this published form to clipboard',
    parameters: [],
    handler: async () => {
      if (!form) {
        throw new Error('Form not loaded')
      }
      if (form.status !== 'published') {
        throw new Error('Cannot copy link: form is not published yet')
      }

      if (!shareableLink) {
        throw new Error('No shareable link available')
      }

      if (onCopyLink) {
        onCopyLink()
      } else {
        await navigator.clipboard.writeText(shareableLink)
      }

      return `Share link copied: ${shareableLink}`
    },
  })

  // Tool: View submissions
  useFrontendTool({
    name: 'viewSubmissions',
    description: 'Navigate to the submissions page for this form',
    parameters: [],
    handler: async () => {
      if (!form) {
        throw new Error('Form not loaded')
      }
      if (form.status !== 'published') {
        throw new Error('Cannot view submissions: form is not published yet')
      }

      router.push(`/forms/${form.id}/submissions`)
      return `Navigating to submissions for "${form.title}"`
    },
  })

  // Tool: Edit form (for draft forms)
  useFrontendTool({
    name: 'editForm',
    description: 'Navigate to the edit page for this draft form',
    parameters: [],
    handler: async () => {
      if (!form) {
        throw new Error('Form not loaded')
      }
      if (form.status === 'published') {
        throw new Error('Cannot edit: published forms are read-only')
      }

      if (onEdit) {
        onEdit()
      } else {
        router.push(`/forms/${form.id}/edit`)
      }

      return `Navigating to edit "${form.title}"`
    },
  })

  // Tool: Delete form
  if (onDelete) {
    useFrontendTool({
      name: 'deleteForm',
      description: 'Delete this form permanently (requires confirmation)',
      parameters: [
        {
          name: 'confirm',
          type: 'boolean',
          description: 'Must be true to confirm deletion',
          required: true,
        },
      ],
      handler: async (args) => {
        const { confirm } = args as { confirm: boolean }

        if (!confirm) {
          throw new Error('Deletion not confirmed. Set confirm=true to delete.')
        }

        await onDelete()
        const current = formRef.current
        return `Form "${current?.title || 'form'}" deleted`
      },
    })
  }

  // Tool: Get form details
  useFrontendTool({
    name: 'getFormDetails',
    description: 'Get detailed information about the current form',
    parameters: [],
    handler: async () => {
      const current = formRef.current
      if (!current) {
        return { error: 'Form not loaded' }
      }

      return {
        id: current.id,
        title: current.title,
        status: current.status,
        slug: current.slug,
        shareableLink: shareableLink || null,
        fieldsCount: current.fields?.length || 0,
        isPublished: current.status === 'published',
        canEdit: current.status !== 'published',
        fields: current.fields?.map((f, i) => ({
          index: i + 1,
          type: f.type,
          label: f.label,
          required: f.required,
        })),
      }
    },
  })

  // Tool: Navigate back to forms list
  useFrontendTool({
    name: 'goToFormsList',
    description: 'Navigate back to the forms list page',
    parameters: [],
    handler: async () => {
      router.push('/forms')
      return 'Navigating to forms list'
    },
  })
}

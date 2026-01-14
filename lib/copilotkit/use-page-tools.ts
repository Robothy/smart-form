'use client'

import { useEffect, useRef } from 'react'
import { toolState } from './tools-registry'

/**
 * Page tool hooks for exposing page state to the tool registry
 *
 * These hooks allow pages to provide state and callbacks to tools
 * without directly importing tool-specific hooks, maintaining
 * decoupling between pages and tool implementations.
 */

// ============================================================================
// Forms List Page Hooks
// ============================================================================

export interface UseFormsListPageToolsArgs {
  forms: Array<{
    id: string
    title: string
    status: 'draft' | 'published'
    description?: string
    fieldsCount: number
    submissionsCount: number
    shareableLink?: string
    slug?: string | null
  }>
  counts: {
    all: number
    draft: number
    published: number
  }
  currentFilter: 'all' | 'draft' | 'published'
  onFilterForms: (status: 'all' | 'draft' | 'published') => void
}

/**
 * Hook for forms list page to expose state to tools
 */
export function useFormsListPageTools(args: UseFormsListPageToolsArgs) {
  const { forms, counts, currentFilter, onFilterForms } = args

  useEffect(() => {
    toolState.set('forms', forms)
    toolState.set('counts', counts)
    toolState.set('currentFilter', currentFilter)
  }, [forms, counts, currentFilter])

  // Listen for filter actions from tools
  useEffect(() => {
    const filterAction = toolState.get('filterAction')
    if (filterAction && filterAction !== currentFilter) {
      onFilterForms(filterAction)
      toolState.delete('filterAction')
    }
  }, [currentFilter, onFilterForms])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toolState.delete('forms')
      toolState.delete('counts')
      toolState.delete('currentFilter')
    }
  }, [])
}

// ============================================================================
// Form Editing Page Hooks (New/Edit)
// ============================================================================

export interface UseFormEditingPageToolsArgs<TForm = any> {
  form: TForm
  onUpdateForm: (updates: any) => void
}

/**
 * Hook for form editing pages (new and edit) to expose state to tools
 */
export function useFormEditingPageTools<TForm = any>(args: UseFormEditingPageToolsArgs<TForm>) {
  const { form, onUpdateForm } = args

  // Use a ref to track the latest form state synchronously
  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])

  useEffect(() => {
    toolState.set('formState', form)
  }, [form])

  // Expose the update function to tools
  useEffect(() => {
    const updateForm = async (updates: any) => {
      const current = formRef.current
      let updated: any

      if (typeof updates === 'function') {
        const result = updates({
          title: current.title,
          description: current.description,
          fields: current.fields,
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

      // Update the ref immediately to avoid race conditions
      formRef.current = updated
      onUpdateForm(updated)
    }

    toolState.set('updateForm', updateForm)
  }, [onUpdateForm])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toolState.delete('formState')
      toolState.delete('updateForm')
    }
  }, [])
}

// ============================================================================
// Form Filling Page Hooks
// ============================================================================

export interface UseFormFillingPageToolsArgs {
  form: {
    id: string
    title: string
    description?: string
    fields: any[]
  } | null
  values: Record<string, string | string[]>
  onSetValue: (fieldId: string, value: string | string[]) => void
  onSetMultipleValues: (updates: Record<string, string | string[]>) => void
  onClearValue: (fieldId: string) => void
}

/**
 * Hook for form filling page to expose state to tools
 */
export function useFormFillingPageTools(args: UseFormFillingPageToolsArgs) {
  const { form, values, onSetValue, onSetMultipleValues, onClearValue } = args

  useEffect(() => {
    toolState.set('fillForm', form)
    toolState.set('fillValues', values)
  }, [form, values])

  useEffect(() => {
    toolState.set('setFieldValue', onSetValue)
    toolState.set('setMultipleFieldValues', onSetMultipleValues)
    toolState.set('clearFieldValue', onClearValue)
  }, [onSetValue, onSetMultipleValues, onClearValue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toolState.delete('fillForm')
      toolState.delete('fillValues')
      toolState.delete('setFieldValue')
      toolState.delete('setMultipleFieldValues')
      toolState.delete('clearFieldValue')
    }
  }, [])
}

// ============================================================================
// Form Viewing Page Hooks
// ============================================================================

export interface UseFormViewingPageToolsArgs {
  form: {
    id: string
    title: string
    description?: string
    status: 'draft' | 'published'
    slug?: string | null
    fields?: any[]
  } | null
  formId: string
}

/**
 * Hook for form viewing page to expose state to tools
 */
export function useFormViewingPageTools(args: UseFormViewingPageToolsArgs) {
  const { form, formId } = args

  useEffect(() => {
    toolState.set('viewForm', form)
    toolState.set('viewFormId', formId)
  }, [form, formId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toolState.delete('viewForm')
      toolState.delete('viewFormId')
    }
  }, [])
}

// ============================================================================
// Submissions Viewing Page Hooks
// ============================================================================

export interface UseSubmissionsViewingPageToolsArgs {
  formTitle: string
  totalCount: number
  fields: any[]
  submissions: any[]
  currentPage: number
  rowsPerPage: number
  onPageChange: (page: number) => void
}

/**
 * Hook for submissions viewing page to expose state to tools
 */
export function useSubmissionsViewingPageTools(args: UseSubmissionsViewingPageToolsArgs) {
  const {
    formTitle,
    totalCount,
    fields,
    submissions,
    currentPage,
    rowsPerPage,
    onPageChange,
  } = args

  useEffect(() => {
    toolState.set('submissionsFormTitle', formTitle)
    toolState.set('submissionsTotalCount', totalCount)
    toolState.set('submissionsFields', fields)
    toolState.set('submissionsData', submissions)
    toolState.set('submissionsCurrentPage', currentPage)
    toolState.set('submissionsRowsPerPage', rowsPerPage)
    toolState.set('onSubmissionsPageChange', onPageChange)
  }, [formTitle, totalCount, fields, submissions, currentPage, rowsPerPage, onPageChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toolState.delete('submissionsFormTitle')
      toolState.delete('submissionsTotalCount')
      toolState.delete('submissionsFields')
      toolState.delete('submissionsData')
      toolState.delete('submissionsCurrentPage')
      toolState.delete('submissionsRowsPerPage')
      toolState.delete('onSubmissionsPageChange')
    }
  }, [])
}

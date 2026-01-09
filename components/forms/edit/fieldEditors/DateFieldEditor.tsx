'use client'

import { CommonFieldEditor } from './CommonFieldEditor'
import type { FieldEditorProps } from './FieldEditorProps'

/**
 * DateFieldEditor - Editor for date fields
 * Includes only common fields (label + required)
 * Date fields don't have placeholder or other type-specific properties
 */
export function DateFieldEditor(props: FieldEditorProps) {
  return <CommonFieldEditor {...props} />
}

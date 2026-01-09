'use client'

import { CommonFieldEditor } from './CommonFieldEditor'
import { OptionsEditor } from './OptionsEditor'
import type { FieldEditorProps } from './FieldEditorProps'

/**
 * CheckboxFieldEditor - Editor for checkbox fields
 * Includes common fields + options editor
 */
export function CheckboxFieldEditor(props: FieldEditorProps) {
  return (
    <>
      <CommonFieldEditor {...props} />
      <OptionsEditor {...props} />
    </>
  )
}

'use client'

import { CommonFieldEditor } from './CommonFieldEditor'
import { OptionsEditor } from './OptionsEditor'
import type { FieldEditorProps } from './FieldEditorProps'

/**
 * RadioFieldEditor - Editor for radio button fields
 * Includes common fields + options editor
 */
export function RadioFieldEditor(props: FieldEditorProps) {
  return (
    <>
      <CommonFieldEditor {...props} />
      <OptionsEditor {...props} />
    </>
  )
}

import { TextFieldEditor } from './TextFieldEditor'
import { TextareaFieldEditor } from './TextareaFieldEditor'
import { DateFieldEditor } from './DateFieldEditor'
import { RadioFieldEditor } from './RadioFieldEditor'
import { CheckboxFieldEditor } from './CheckboxFieldEditor'
import type { FieldEditorRegistry } from './FieldEditorProps'

/**
 * Registry mapping field types to their editor components
 * To add a new field type:
 * 1. Add to FormFieldType in types.ts
 * 2. Create a new editor component
 * 3. Add entry to this registry
 */
export const FIELD_EDITOR_REGISTRY: FieldEditorRegistry = {
  text: {
    component: TextFieldEditor,
    label: 'Text',
    description: 'Single-line text input',
  },
  textarea: {
    component: TextareaFieldEditor,
    label: 'Textarea',
    description: 'Multi-line text input',
  },
  date: {
    component: DateFieldEditor,
    label: 'Date',
    description: 'Date picker',
  },
  radio: {
    component: RadioFieldEditor,
    label: 'Radio',
    description: 'Single selection from options',
  },
  checkbox: {
    component: CheckboxFieldEditor,
    label: 'Checkbox',
    description: 'Multiple selection from options',
  },
}

// Export types for backward compatibility and reuse
export * from './types'
export * from './FieldEditorProps'
export { CommonFieldEditor } from './CommonFieldEditor'
export { OptionsEditor } from './OptionsEditor'

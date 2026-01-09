import type { FormFieldData, FormFieldType } from './types'

export interface FieldEditorProps {
  field: FormFieldData
  onChange: (updates: Partial<FormFieldData>) => void
  readonly?: boolean
}

export interface FieldEditorConfig {
  component: React.ComponentType<FieldEditorProps>
  label: string
  description?: string
}

export type FieldEditorRegistry = Record<FormFieldType, FieldEditorConfig>

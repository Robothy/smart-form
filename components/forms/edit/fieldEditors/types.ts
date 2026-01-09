export type FormFieldType = 'text' | 'textarea' | 'date' | 'radio' | 'checkbox'

export interface FormFieldData {
  id?: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: { label: string; value: string }[]
  order: number
}

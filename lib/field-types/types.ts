import { ReactNode } from 'react'

/**
 * Shared field types for the field type registry system
 */

export type FormFieldType = 'text' | 'textarea' | 'date' | 'radio' | 'checkbox'

export interface FormFieldData {
  id?: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: FieldOption[]
  order: number
}

export interface FieldOption {
  label: string
  value: string
}

export type FieldValue = string | string[]

// ============================================================================
// Edit Mode Props (for FormBuilder)
// ============================================================================

export interface FieldEditProps {
  field: FormFieldData
  onChange: (updates: Partial<FormFieldData>) => void
  readonly?: boolean
}

// ============================================================================
// Fill Mode Props (for FormFiller)
// ============================================================================

export interface FieldFillProps {
  field: FormFieldData
  value: FieldValue
  onChange: (value: FieldValue) => void
  error?: string
  disabled?: boolean
}

// ============================================================================
// View Mode Props (for viewing submissions)
// ============================================================================

export interface FieldViewProps {
  field: FormFieldData
  value: FieldValue
}

// ============================================================================
// Field Type Configuration
// ============================================================================

export interface FieldTypeConfig {
  type: FormFieldType
  defaultProps: Partial<FormFieldData>

  // Edit mode - for configuring the field (optional - only needed for fields with type-specific settings)
  EditComponent?: React.ComponentType<FieldEditProps>

  // Fill mode - for user input
  FillComponent: React.ComponentType<FieldFillProps>

  // View mode - for displaying submitted values (optional)
  ViewComponent?: React.ComponentType<FieldViewProps>

  // Server-side validation
  validateValue?: (field: FormFieldData, value: unknown) => { valid: boolean; error?: string }
}

// ============================================================================
// Field Type Registry
// ============================================================================

export interface FieldTypeRegistry {
  [key: string]: FieldTypeConfig
}

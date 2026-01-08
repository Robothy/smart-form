/**
 * Field Type Registry
 *
 * Central registry for all field type configurations.
 * Each field type defines its own edit, fill, and view components,
 * along with validation logic.
 *
 * To add a new field type:
 * 1. Create a new directory in lib/field-types/{type}/
 * 2. Export a {type}FieldType object matching FieldTypeConfig
 * 3. Import and add to the registry below
 */

import type { FieldTypeRegistry, FormFieldType } from './types'
import { textFieldType } from './text'
import { textareaFieldType } from './textarea'
import { dateFieldType } from './date'
import { radioFieldType } from './radio'
import { checkboxFieldType } from './checkbox'

export const FIELD_TYPE_REGISTRY: FieldTypeRegistry = {
  text: textFieldType,
  textarea: textareaFieldType,
  date: dateFieldType,
  radio: radioFieldType,
  checkbox: checkboxFieldType,
}

/**
 * Get a field type configuration by type
 */
export function getFieldType(type: FormFieldType) {
  return FIELD_TYPE_REGISTRY[type]
}

/**
 * Get all available field types
 */
export function getFieldTypes(): FormFieldType[] {
  return Object.keys(FIELD_TYPE_REGISTRY) as FormFieldType[]
}

/**
 * Check if a field type exists
 */
export function isValidFieldType(type: string): type is FormFieldType {
  return type in FIELD_TYPE_REGISTRY
}

// Re-export types
export * from './types'

import { z } from 'zod'

/**
 * Form status enum
 */
export const FormStatusSchema = z.enum(['draft', 'published'])
export type FormStatus = z.infer<typeof FormStatusSchema>

/**
 * Field type enum
 */
export const FieldTypeSchema = z.enum(['text', 'textarea', 'date', 'radio', 'checkbox'])
export type FieldType = z.infer<typeof FieldTypeSchema>

/**
 * Field option schema (for radio/checkbox)
 */
export const FieldOptionSchema = z.object({
  label: z.string().max(255),
  value: z.string().max(255),
})

/**
 * Field data validation by type
 */
const TextFieldSchema = z.string().max(1000, 'Text must be less than 1000 characters')
const TextareaFieldSchema = z.string().max(10000, 'Text must be less than 10000 characters')
const DateFieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid date',
})
const RadioFieldSchema = z.string()
const CheckboxFieldSchema = z.array(z.string())

/**
 * Form field value schema based on field type
 */
export const FormFieldValueSchema = z.object({
  text: TextFieldSchema,
  textarea: TextareaFieldSchema,
  date: DateFieldSchema,
  radio: RadioFieldSchema,
  checkbox: CheckboxFieldSchema,
})

/**
 * Create form request schema
 */
export const CreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
})

/**
 * Update form request schema
 */
export const UpdateFormSchema = CreateFormSchema.partial()

/**
 * Base form field schema
 */
const BaseFormFieldSchema = z.object({
  type: FieldTypeSchema,
  label: z.string().min(1, 'Label is required').max(255, 'Label must be less than 255 characters'),
  placeholder: z.string().max(500, 'Placeholder must be less than 500 characters').optional(),
  required: z.boolean().default(false),
  options: z.array(FieldOptionSchema).optional(),
  order: z.number().int().positive(),
})

/**
 * Create form field request schema
 */
export const CreateFormFieldSchema = BaseFormFieldSchema.refine(
  (data) => {
    // Radio and checkbox require options
    if ((data.type === 'radio' || data.type === 'checkbox') && (!data.options || data.options.length === 0)) {
      return false
    }
    return true
  },
  { message: 'Radio and checkbox fields require at least one option' }
)

/**
 * Update form field request schema
 */
export const UpdateFormFieldSchema = BaseFormFieldSchema.partial()

/**
 * Form submission data schema (dynamic based on form definition)
 */
export const FormSubmissionDataSchema = z.record(z.union([z.string(), z.array(z.string()), z.null()]))

/**
 * Submit form request schema
 */
export const SubmitFormSchema = z.object({
  data: FormSubmissionDataSchema,
})

/**
 * AI design request schema
 */
export const AIDesignRequestSchema = z.object({
  formId: z.string().uuid(),
  message: z.string().min(1, 'Message is required'),
  currentFields: z.array(z.object({
    id: z.string().uuid(),
    type: FieldTypeSchema,
    label: z.string(),
    required: z.boolean(),
  })).optional(),
})

/**
 * AI fill request schema
 */
export const AIFillRequestSchema = z.object({
  formId: z.string().uuid(),
  message: z.string().min(1, 'Message is required'),
  currentValues: z.record(z.union([z.string(), z.array(z.string())])).optional(),
  fieldId: z.string().uuid().optional(),
})

/**
 * Publish form validation schema
 * Validates that a form can be published
 */
export const PublishFormSchema = z.object({
  fieldCount: z.number().int().min(1, 'Form must have at least one field'),
  status: z.literal('draft', {
    errorMap: () => ({ message: 'Form is already published' }),
  }),
})

/**
 * Publish form request input type
 */
export type PublishFormInput = z.infer<typeof PublishFormSchema>

// Type exports
export type CreateFormInput = z.infer<typeof CreateFormSchema>
export type UpdateFormInput = z.infer<typeof UpdateFormSchema>
export type CreateFormFieldInput = z.infer<typeof CreateFormFieldSchema>
export type UpdateFormFieldInput = z.infer<typeof UpdateFormFieldSchema>
export type FormSubmissionData = z.infer<typeof FormSubmissionDataSchema>
export type SubmitFormInput = z.infer<typeof SubmitFormSchema>
export type AIDesignInput = z.infer<typeof AIDesignRequestSchema>
export type AIFillInput = z.infer<typeof AIFillRequestSchema>

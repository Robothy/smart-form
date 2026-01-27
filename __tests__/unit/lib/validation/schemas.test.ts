import { describe, it, expect } from 'vitest'
import {
  FormStatusSchema,
  FieldTypeSchema,
  FieldOptionSchema,
  CreateFormSchema,
  UpdateFormSchema,
  CreateFormFieldSchema,
  UpdateFormFieldSchema,
  FormSubmissionDataSchema,
  SubmitFormSchema,
  PublishFormSchema,
  AIDesignRequestSchema,
  AIFillRequestSchema,
  type CreateFormInput,
  type UpdateFormInput,
  type CreateFormFieldInput,
  type PublishFormInput,
} from '@/lib/validation/schemas'

describe('FormStatusSchema', () => {
  it('should accept valid status values', () => {
    expect(FormStatusSchema.parse('draft')).toBe('draft')
    expect(FormStatusSchema.parse('published')).toBe('published')
  })

  it('should reject invalid status values', () => {
    expect(() => FormStatusSchema.parse('invalid')).toThrow()
    expect(() => FormStatusSchema.parse('DRAFT')).toThrow()
    expect(() => FormStatusSchema.parse('')).toThrow()
  })
})

describe('FieldTypeSchema', () => {
  it('should accept all valid field types', () => {
    const types = ['text', 'textarea', 'date', 'radio', 'checkbox'] as const
    types.forEach((type) => {
      expect(FieldTypeSchema.parse(type)).toBe(type)
    })
  })

  it('should reject invalid field types', () => {
    expect(() => FieldTypeSchema.parse('email')).toThrow()
    expect(() => FieldTypeSchema.parse('number')).toThrow()
    expect(() => FieldTypeSchema.parse('select')).toThrow()
    expect(() => FieldTypeSchema.parse('')).toThrow()
  })
})

describe('FieldOptionSchema', () => {
  it('should accept valid option with label and value', () => {
    const validOption = { label: 'Option 1', value: 'opt1' }
    expect(FieldOptionSchema.parse(validOption)).toEqual(validOption)
  })

  it('should accept option with max length strings', () => {
    const maxString = 'a'.repeat(255)
    const validOption = { label: maxString, value: maxString }
    expect(FieldOptionSchema.parse(validOption)).toEqual(validOption)
  })

  it('should reject option with label exceeding 255 characters', () => {
    const invalidOption = { label: 'a'.repeat(256), value: 'opt1' }
    expect(() => FieldOptionSchema.parse(invalidOption)).toThrow()
  })

  it('should reject option with value exceeding 255 characters', () => {
    const invalidOption = { label: 'Option 1', value: 'a'.repeat(256) }
    expect(() => FieldOptionSchema.parse(invalidOption)).toThrow()
  })

  it('should accept option with empty label (schema allows empty strings)', () => {
    // Note: The FieldOptionSchema only has max(255) constraint, not min(1)
    // So empty strings are technically valid according to the schema
    const validOption = { label: '', value: 'opt1' }
    expect(FieldOptionSchema.parse(validOption)).toEqual(validOption)
  })
})

describe('CreateFormSchema', () => {
  it('should validate form with title and description', () => {
    const validForm: CreateFormInput = {
      title: 'Test Form',
      description: 'A test description',
    }
    const result = CreateFormSchema.safeParse(validForm)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Test Form')
      expect(result.data.description).toBe('A test description')
    }
  })

  it('should validate form with title only (description optional)', () => {
    const validForm: CreateFormInput = {
      title: 'Test Form',
    }
    const result = CreateFormSchema.safeParse(validForm)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Test Form')
      expect(result.data.description).toBeUndefined()
    }
  })

  it('should reject form with empty title', () => {
    const invalidForm = { title: '', description: 'A test description' }
    const result = CreateFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it('should reject form with title exceeding 255 characters', () => {
    const invalidForm = {
      title: 'a'.repeat(256),
      description: 'A test description',
    }
    const result = CreateFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it('should reject form with description exceeding 1000 characters', () => {
    const invalidForm = {
      title: 'Test Form',
      description: 'a'.repeat(1001),
    }
    const result = CreateFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it('should reject form without title', () => {
    const invalidForm = { description: 'A test description' }
    const result = CreateFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })
})

describe('UpdateFormSchema', () => {
  it('should allow partial updates with title only', () => {
    const update: UpdateFormInput = { title: 'Updated Title' }
    const result = UpdateFormSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow partial updates with description only', () => {
    const update: UpdateFormInput = { description: 'Updated description' }
    const result = UpdateFormSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow empty object (no updates)', () => {
    const update: UpdateFormInput = {}
    const result = UpdateFormSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow full update', () => {
    const update: UpdateFormInput = {
      title: 'Updated Title',
      description: 'Updated description',
    }
    const result = UpdateFormSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should reject invalid title in partial update', () => {
    const update = { title: '' }
    const result = UpdateFormSchema.safeParse(update)
    expect(result.success).toBe(false)
  })
})

describe('CreateFormFieldSchema', () => {
  it('should validate text field', () => {
    const validField: CreateFormFieldInput = {
      type: 'text',
      label: 'Name',
      placeholder: 'Enter name',
      required: true,
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(validField)
    expect(result.success).toBe(true)
  })

  it('should validate textarea field', () => {
    const validField: CreateFormFieldInput = {
      type: 'textarea',
      label: 'Comments',
      placeholder: 'Enter comments',
      required: false,
      order: 2,
    }
    const result = CreateFormFieldSchema.safeParse(validField)
    expect(result.success).toBe(true)
  })

  it('should validate date field', () => {
    const validField: CreateFormFieldInput = {
      type: 'date',
      label: 'Birthday',
      required: false,
      order: 3,
    }
    const result = CreateFormFieldSchema.safeParse(validField)
    expect(result.success).toBe(true)
  })

  it('should validate radio field with options', () => {
    const validField: CreateFormFieldInput = {
      type: 'radio',
      label: 'Choose one',
      required: true,
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ],
      order: 4,
    }
    const result = CreateFormFieldSchema.safeParse(validField)
    expect(result.success).toBe(true)
  })

  it('should validate checkbox field with options', () => {
    const validField: CreateFormFieldInput = {
      type: 'checkbox',
      label: 'Select multiple',
      required: false,
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c' },
      ],
      order: 5,
    }
    const result = CreateFormFieldSchema.safeParse(validField)
    expect(result.success).toBe(true)
  })

  it('should reject radio field without options', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'radio',
      label: 'Choose one',
      required: true,
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least one option')
    }
  })

  it('should reject checkbox field without options', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'checkbox',
      label: 'Select multiple',
      required: true,
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least one option')
    }
  })

  it('should reject radio field with empty options array', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'radio',
      label: 'Choose one',
      required: true,
      options: [],
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
  })

  it('should reject field with empty label', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'text',
      label: '',
      required: true,
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
  })

  it('should reject field with label exceeding 255 characters', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'text',
      label: 'a'.repeat(256),
      required: true,
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
  })

  it('should reject field with placeholder exceeding 500 characters', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'text',
      label: 'Name',
      placeholder: 'a'.repeat(501),
      required: true,
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
  })

  it('should reject field with non-positive order', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'text',
      label: 'Name',
      required: true,
      order: 0,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
  })

  it('should reject field with negative order', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'text',
      label: 'Name',
      required: true,
      order: -1,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
  })

  it('should reject field with non-integer order', () => {
    const invalidField: CreateFormFieldInput = {
      type: 'text',
      label: 'Name',
      required: true,
      order: 1.5,
    }
    const result = CreateFormFieldSchema.safeParse(invalidField)
    expect(result.success).toBe(false)
  })

  it('should default required to false', () => {
    const fieldWithoutRequired = {
      type: 'text' as const,
      label: 'Name',
      order: 1,
    }
    const result = CreateFormFieldSchema.safeParse(fieldWithoutRequired)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.required).toBe(false)
    }
  })
})

describe('UpdateFormFieldSchema', () => {
  it('should allow partial updates', () => {
    const update = { label: 'Updated Label' }
    const result = UpdateFormFieldSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow empty object (no updates)', () => {
    const update = {}
    const result = UpdateFormFieldSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow updating type', () => {
    const update = { type: 'textarea' as const }
    const result = UpdateFormFieldSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow updating required status', () => {
    const update = { required: true }
    const result = UpdateFormFieldSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow updating options', () => {
    const update = {
      options: [
        { label: 'New Option', value: 'new' },
      ],
    }
    const result = UpdateFormFieldSchema.safeParse(update)
    expect(result.success).toBe(true)
  })
})

describe('FormSubmissionDataSchema', () => {
  it('should accept record with string values', () => {
    const data = { field1: 'value1', field2: 'value2' }
    const result = FormSubmissionDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept record with array values', () => {
    const data = { field1: ['a', 'b', 'c'] }
    const result = FormSubmissionDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept record with null values', () => {
    const data = { field1: null, field2: 'value' }
    const result = FormSubmissionDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept empty record', () => {
    const data = {}
    const result = FormSubmissionDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject numeric values', () => {
    const data = { field1: 123 }
    const result = FormSubmissionDataSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject boolean values', () => {
    const data = { field1: true }
    const result = FormSubmissionDataSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject object values', () => {
    const data = { field1: { nested: 'value' } }
    const result = FormSubmissionDataSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('SubmitFormSchema', () => {
  it('should accept valid submission data', () => {
    const submission = { data: { field1: 'value1', field2: 'value2' } }
    const result = SubmitFormSchema.safeParse(submission)
    expect(result.success).toBe(true)
  })

  it('should accept empty submission data', () => {
    const submission = { data: {} }
    const result = SubmitFormSchema.safeParse(submission)
    expect(result.success).toBe(true)
  })

  it('should accept submission with array values', () => {
    const submission = { data: { field1: ['a', 'b'] } }
    const result = SubmitFormSchema.safeParse(submission)
    expect(result.success).toBe(true)
  })

  it('should accept submission with null values', () => {
    const submission = { data: { field1: null } }
    const result = SubmitFormSchema.safeParse(submission)
    expect(result.success).toBe(true)
  })

  it('should reject submission without data property', () => {
    const submission = {}
    const result = SubmitFormSchema.safeParse(submission)
    expect(result.success).toBe(false)
  })
})

describe('PublishFormSchema', () => {
  it('should accept valid draft form with fields', () => {
    const validInput: PublishFormInput = {
      fieldCount: 1,
      status: 'draft',
    }
    const result = PublishFormSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should accept form with multiple fields', () => {
    const validInput: PublishFormInput = {
      fieldCount: 5,
      status: 'draft',
    }
    const result = PublishFormSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject form with zero fields', () => {
    const invalidInput = {
      fieldCount: 0,
      status: 'draft' as const,
    }
    const result = PublishFormSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least one field')
    }
  })

  it('should reject form with negative field count', () => {
    const invalidInput = {
      fieldCount: -1,
      status: 'draft' as const,
    }
    const result = PublishFormSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject already published form', () => {
    const invalidInput = {
      fieldCount: 1,
      status: 'published' as const,
    }
    const result = PublishFormSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('already published')
    }
  })

  it('should reject invalid status', () => {
    const invalidInput = {
      fieldCount: 1,
      status: 'invalid' as const,
    }
    const result = PublishFormSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })
})

describe('AIDesignRequestSchema', () => {
  it('should accept valid AI design request', () => {
    const validRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Add a name field',
    }
    const result = AIDesignRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should accept request with current fields', () => {
    const validRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Add a name field',
      currentFields: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'text' as const,
          label: 'Email',
          required: true,
        },
      ],
    }
    const result = AIDesignRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should reject request with invalid UUID', () => {
    const invalidRequest = {
      formId: 'not-a-uuid',
      message: 'Add a name field',
    }
    const result = AIDesignRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })

  it('should reject request with empty message', () => {
    const invalidRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: '',
    }
    const result = AIDesignRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })

  it('should reject request without message', () => {
    const invalidRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = AIDesignRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })
})

describe('AIFillRequestSchema', () => {
  it('should accept valid AI fill request', () => {
    const validRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Fill out this form',
    }
    const result = AIFillRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should accept request with current values', () => {
    const validRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Fill out this form',
      currentValues: { field1: 'value1' },
    }
    const result = AIFillRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should accept request with fieldId', () => {
    const validRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Fill out this field',
      fieldId: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = AIFillRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should accept request with array current values', () => {
    const validRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: 'Fill out this form',
      currentValues: { field1: ['a', 'b'] },
    }
    const result = AIFillRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should reject request with invalid UUID', () => {
    const invalidRequest = {
      formId: 'not-a-uuid',
      message: 'Fill out this form',
    }
    const result = AIFillRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })

  it('should reject request with empty message', () => {
    const invalidRequest = {
      formId: '550e8400-e29b-41d4-a716-446655440000',
      message: '',
    }
    const result = AIFillRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })
})

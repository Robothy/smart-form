import { describe, it, expect } from 'vitest'
import {
  successResponse,
  errorResponse,
  ErrorCode,
  type ApiResponse,
  type ApiError,
} from '@/lib/utils/api-response'

describe('successResponse', () => {
  it('should create a success response with data', () => {
    const data = { id: '123', title: 'Test Form' }
    const response = successResponse(data)

    expect(response).toEqual({
      success: true,
      data,
    })
  })

  it('should handle string data', () => {
    const response = successResponse('test string')
    expect(response).toEqual({
      success: true,
      data: 'test string',
    })
  })

  it('should handle number data', () => {
    const response = successResponse(42)
    expect(response).toEqual({
      success: true,
      data: 42,
    })
  })

  it('should handle boolean data', () => {
    const response = successResponse(true)
    expect(response).toEqual({
      success: true,
      data: true,
    })
  })

  it('should handle null data', () => {
    const response = successResponse(null)
    expect(response).toEqual({
      success: true,
      data: null,
    })
  })

  it('should handle array data', () => {
    const data = [{ id: '1' }, { id: '2' }]
    const response = successResponse(data)
    expect(response).toEqual({
      success: true,
      data,
    })
  })

  it('should handle object data', () => {
    const data = { forms: [], count: 0 }
    const response = successResponse(data)
    expect(response).toEqual({
      success: true,
      data,
    })
  })

  it('should handle complex nested data', () => {
    const data = {
      forms: [
        { id: '1', title: 'Form 1', fields: [{ id: 'f1', type: 'text' }] },
      ],
      pagination: { page: 1, limit: 10, total: 1 },
    }
    const response = successResponse(data)
    expect(response).toEqual({
      success: true,
      data,
    })
  })

  it('should have correct TypeScript type', () => {
    const response: ApiResponse<{ id: string }> = successResponse({ id: '123' })
    expect(response.success).toBe(true)
    if (response.success) {
      expect(response.data.id).toBe('123')
    }
  })
})

describe('errorResponse', () => {
  it('should create an error response with code and message', () => {
    const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid input')

    expect(response).toEqual({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid input',
      },
    })
  })

  it('should handle validation error code', () => {
    const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Validation failed')

    expect(response.success).toBe(false)
    expect(response.error.code).toBe('VALIDATION_ERROR')
    expect(response.error.message).toBe('Validation failed')
  })

  it('should handle not found error code', () => {
    const response = errorResponse(ErrorCode.NOT_FOUND, 'Form not found')

    expect(response.success).toBe(false)
    expect(response.error.code).toBe('NOT_FOUND')
    expect(response.error.message).toBe('Form not found')
  })

  it('should handle forbidden error code', () => {
    const response = errorResponse(ErrorCode.FORBIDDEN, 'Access denied')

    expect(response.success).toBe(false)
    expect(response.error.code).toBe('FORBIDDEN')
    expect(response.error.message).toBe('Access denied')
  })

  it('should handle internal error code', () => {
    const response = errorResponse(ErrorCode.INTERNAL_ERROR, 'Something went wrong')

    expect(response.success).toBe(false)
    expect(response.error.code).toBe('INTERNAL_ERROR')
    expect(response.error.message).toBe('Something went wrong')
  })

  it('should include details when provided', () => {
    const details = { fieldId: 'field-1', error: 'Required field' }
    const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid input', details)

    expect(response).toEqual({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid input',
        details,
      },
    })
  })

  it('should handle object details', () => {
    const details = { field: 'email', reason: 'Invalid format' }
    const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid input', details)

    expect(response.error.details).toEqual(details)
  })

  it('should handle array details', () => {
    const details = ['field1', 'field2']
    const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Multiple errors', details)

    expect(response.error.details).toEqual(details)
  })

  it('should handle null details', () => {
    const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid input', null)

    expect(response.error.details).toBe(null)
  })

  it('should handle undefined details', () => {
    const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid input', undefined)

    expect(response.error.details).toBe(undefined)
  })

  it('should have correct TypeScript type', () => {
    const response: ApiError = errorResponse(ErrorCode.NOT_FOUND, 'Not found')
    expect(response.success).toBe(false)
    if (!response.success) {
      expect(response.error.code).toBe('NOT_FOUND')
    }
  })
})

describe('ErrorCode', () => {
  it('should have all required error codes', () => {
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
    expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND')
    expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN')
    expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
  })

  it('should be readonly and prevent modification', () => {
    // TypeScript should prevent this at compile time
    // At runtime, this test verifies the object structure
    expect(Object.keys(ErrorCode)).toEqual([
      'VALIDATION_ERROR',
      'NOT_FOUND',
      'FORBIDDEN',
      'INTERNAL_ERROR',
    ])
  })
})

describe('ApiResponse type', () => {
  it('should type success response correctly', () => {
    const data = { id: '123', title: 'Test' }
    const response: ApiResponse<typeof data> = successResponse(data)

    if (response.success) {
      // TypeScript should know response.data exists and is of correct type
      expect(response.data.id).toBe('123')
      expect(response.data.title).toBe('Test')
    }
  })

  it('should type error response correctly', () => {
    const response: ApiResponse = errorResponse(ErrorCode.NOT_FOUND, 'Not found')

    if (!response.success) {
      // TypeScript should know response.error exists
      expect(response.error.code).toBe('NOT_FOUND')
      expect(response.error.message).toBe('Not found')
    }
  })
})

describe('ApiError type', () => {
  it('should always have success: false', () => {
    const response: ApiError = errorResponse(ErrorCode.INTERNAL_ERROR, 'Error')

    expect(response.success).toBe(false)
    // TypeScript should narrow this
    if (response.success === false) {
      expect(response.error).toBeDefined()
    }
  })
})

describe('Response patterns', () => {
  it('should create consistent success responses', () => {
    const responses = [
      successResponse({ id: '1' }),
      successResponse({ id: '2' }),
      successResponse({ id: '3' }),
    ]

    responses.forEach((response) => {
      expect(response.success).toBe(true)
      expect(response).toHaveProperty('data')
      expect(response).not.toHaveProperty('error')
    })
  })

  it('should create consistent error responses', () => {
    const responses = [
      errorResponse(ErrorCode.VALIDATION_ERROR, 'Error 1'),
      errorResponse(ErrorCode.NOT_FOUND, 'Error 2'),
      errorResponse(ErrorCode.FORBIDDEN, 'Error 3'),
    ]

    responses.forEach((response) => {
      expect(response.success).toBe(false)
      expect(response).toHaveProperty('error')
      expect(response.error).toHaveProperty('code')
      expect(response.error).toHaveProperty('message')
    })
  })

  it('should allow discriminating union usage', () => {
    const responses: ApiResponse[] = [
      successResponse({ id: '1' }),
      errorResponse(ErrorCode.VALIDATION_ERROR, 'Error'),
      successResponse({ id: '2' }),
    ]

    const successCount = responses.filter((r) => r.success).length
    const errorCount = responses.filter((r) => !r.success).length

    expect(successCount).toBe(2)
    expect(errorCount).toBe(1)
  })
})

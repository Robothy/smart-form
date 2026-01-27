import { describe, it, expect } from 'vitest'
import { generateSlugFromId } from '@/lib/utils/slug'

describe('generateSlugFromId', () => {
  it('should return the form ID as slug', () => {
    const formId = '550e8400-e29b-41d4-a716-446655440000'
    const slug = generateSlugFromId(formId)
    expect(slug).toBe(formId)
  })

  it('should handle different UUID formats', () => {
    const validUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '123e4567-e89b-12d3-a456-426614174000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
    ]

    validUUIDs.forEach((id) => {
      expect(generateSlugFromId(id)).toBe(id)
    })
  })

  it('should return the same string for any input', () => {
    const inputs = [
      '550e8400-e29b-41d4-a716-446655440000',
      'my-custom-slug',
      'hello-world',
      'test123',
    ]

    inputs.forEach((input) => {
      expect(generateSlugFromId(input)).toBe(input)
    })
  })

  it('should handle empty string', () => {
    expect(generateSlugFromId('')).toBe('')
  })

  it('should return string type', () => {
    const result = generateSlugFromId('550e8400-e29b-41d4-a716-446655440000')
    expect(typeof result).toBe('string')
  })

  it('should be idempotent', () => {
    const input = '550e8400-e29b-41d4-a716-446655440000'
    expect(generateSlugFromId(generateSlugFromId(input))).toBe(input)
  })
})

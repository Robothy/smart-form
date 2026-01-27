import { describe, it, expect } from 'vitest'
import { GET, POST } from '@/app/api/forms/[id]/submissions/route'
import { NextRequest } from 'next/server'

describe('GET /api/forms/[id]/submissions', () => {
  it('should return 404 for non-existent form', async () => {
    const request = new NextRequest('http://localhost:3000/api/forms/non-existent/submissions')
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })
})

describe('POST /api/forms/[id]/submissions', () => {
  it('should return 404 for non-existent form', async () => {
    const body = { field1: 'test' }
    const request = new NextRequest('http://localhost:3000/api/forms/non-existent/submissions', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should return 404 for non-existent form even with invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/forms/test-id/submissions', {
      method: 'POST',
      body: 'invalid json',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'test-id' }) })

    // API checks form existence first, so returns 404
    expect(response.status).toBe(404)
    expect((await response.json()).success).toBe(false)
  })
})

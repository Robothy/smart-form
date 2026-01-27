import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/forms/[id]/publish/route'
import { NextRequest } from 'next/server'

describe('POST /api/forms/[id]/publish', () => {
  it('should return 404 for non-existent form', async () => {
    const request = new NextRequest('http://localhost:3000/api/forms/non-existent/publish')
    const response = await POST(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should have the expected error structure', async () => {
    const request = new NextRequest('http://localhost:3000/api/forms/test-id/publish')
    const response = await POST(request, { params: Promise.resolve({ id: 'test-id' }) })
    const data = await response.json()

    expect(response.status).toBeDefined()
    expect(typeof data.success === 'boolean' || typeof data.error === 'object').toBe(true)
  })
})

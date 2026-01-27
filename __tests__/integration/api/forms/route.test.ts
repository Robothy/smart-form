import { describe, it, expect } from 'vitest'
import { GET, POST } from '@/app/api/forms/route'
import { NextRequest } from 'next/server'

describe('GET /api/forms', () => {
  it('should return 200 with empty forms list', async () => {
    // This is a placeholder integration test
    // Full integration tests with database mocking can be added later
    const request = new NextRequest('http://localhost:3000/api/forms')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBeDefined()
  })
})

describe('POST /api/forms', () => {
  it('should reject form without title', async () => {
    const body = {
      fields: [],
    }

    const request = new NextRequest('http://localhost:3000/api/forms', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should reject form with empty title', async () => {
    const body = {
      title: '',
      fields: [],
    }

    const request = new NextRequest('http://localhost:3000/api/forms', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })
})

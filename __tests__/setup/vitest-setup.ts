import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { getTestDb as getTestDbFromSetup, schema as testSchema } from './test-db'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'
import React from 'react'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock MUI X Date Pickers to avoid ESM import issues
vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: any) => children,
}))

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ children, slots, ...props }: any) => {
    if (slots?.textField) {
      return slots.textField({ InputProps: {}, ...props })
    }
    return React.createElement('input', { type: 'date', ...props })
  },
}))

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: () => null,
}))

// Cleanup React DOM after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
process.env.DATABASE_URL = ':memory:'

// Mock the database client module to use the test database
vi.mock('@/lib/db/client', async () => {
  const actual = await vi.importActual<any>('./test-db')
  return {
    getDb: () => actual.getTestDb(),
    getClient: async () => {
      const db = await actual.getTestDb()
      // Return a mock client that has the execute method expected by libSQL
      const mockClient = {
        execute: async (sql: string, params?: any[]) => {
          // This is a simplified mock - the actual better-sqlite3 client uses .prepare() and .run()
          return []
        },
      }
      return mockClient as any
    },
    schema: actual.schema,
  }
})



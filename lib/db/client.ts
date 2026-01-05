import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const DATABASE_URL = process.env.DATABASE_URL || 'file:data/simple-form.db'

// Singleton client instance
let client: ReturnType<typeof createClient> | null = null
let db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!client) {
    client = createClient({ url: DATABASE_URL })
    db = drizzle(client, { schema })
  }
  return db
}

export function getClient() {
  if (!client) {
    client = createClient({ url: DATABASE_URL })
  }
  return client
}

export { schema }

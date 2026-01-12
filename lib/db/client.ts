import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import fs from 'fs'
import path from 'path'
import { migrate } from 'drizzle-orm/libsql/migrator'

const DATABASE_URL = process.env.DATABASE_URL || 'file:data/simple-form.db'

// Singleton client instance
let client: ReturnType<typeof createClient> | null = null
let db: ReturnType<typeof drizzle> | null = null
let initPromise: Promise<void> | null = null

// Synchronously ensure data directory exists (must be called before async operations)
function ensureDataDir() {
  const dbPath = DATABASE_URL.replace('file:', '')
  const dir = path.dirname(dbPath)
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (error) {
    // Ignore error if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

async function runMigrations(dbToMigrate: ReturnType<typeof drizzle>) {
  try {
    await migrate(dbToMigrate, { migrationsFolder: 'drizzle/migrations' })
  } catch (error) {
    const errMsg = (error as Error).message
    // Only suppress "already exists" type errors - these are harmless
    if (errMsg.includes('already exists')) {
      // Silently ignore - migration was already applied
    } else {
      // Re-throw unexpected errors
      throw error
    }
  }
}

async function initialize() {
  // Ensure directory exists synchronously before creating client
  ensureDataDir()
  client = createClient({ url: DATABASE_URL })
  db = drizzle(client, { schema })
  await runMigrations(db)
}

export async function getDb() {
  if (!db) {
    if (!initPromise) {
      initPromise = initialize().finally(() => {
        // Don't clear initPromise - we keep it to indicate initialization is complete
      })
    }
    await initPromise
  }
  return db!
}

export async function getClient() {
  if (!client) {
    if (!initPromise) {
      initPromise = initialize().finally(() => {
        // Don't clear initPromise - we keep it to indicate initialization is complete
      })
    }
    await initPromise
  }
  return client!
}

export { schema }

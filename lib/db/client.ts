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
let initialized = false

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
    // Migration may have already run, ignore error
    console.warn('Migration note:', (error as Error).message)
  }
}

async function initialize() {
  if (initialized) return
  // Ensure directory exists synchronously before creating client
  ensureDataDir()
  client = createClient({ url: DATABASE_URL })
  db = drizzle(client, { schema })
  await runMigrations(db)
  initialized = true
}

export async function getDb() {
  if (!client) {
    await initialize()
  }
  return db!
}

export async function getClient() {
  if (!client) {
    await initialize()
  }
  return client!
}

export { schema }

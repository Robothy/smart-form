import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '@/lib/db/schema'
import { resolve } from 'path'

// Use workspace root for migrations (process.cwd() returns /workspace during tests)
// The migrations folder is /workspace/drizzle/migrations
const migrationsFolder = resolve(process.cwd(), 'drizzle/migrations')

let testDb: ReturnType<typeof drizzle> | null = null
let sqlite: Database.Database | null = null

export async function getTestDb() {
  if (testDb) {
    return testDb
  }

  // Create in-memory database for tests
  sqlite = new Database(':memory:')
  testDb = drizzle(sqlite, { schema })

  // Run migrations
  await migrate(testDb, { migrationsFolder })

  return testDb
}

export async function closeTestDb() {
  if (sqlite) {
    sqlite.close()
    testDb = null
    sqlite = null
  }
}

export async function resetTestDb() {
  const db = await getTestDb()

  if (!sqlite) {
    return
  }

  // Drop all tables
  sqlite.exec('DROP TABLE IF EXISTS form_submissions')
  sqlite.exec('DROP TABLE IF EXISTS form_fields')
  sqlite.exec('DROP TABLE IF EXISTS forms')

  // Recreate tables
  await migrate(db, { migrationsFolder })
}

export { schema }

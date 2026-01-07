import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Forms table - represents a form with metadata, status, and shareable link
 */
export const forms = sqliteTable('forms', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  status: text('status', {
    enum: ['draft', 'published']
  }).notNull().default('draft'),
  slug: text('slug').unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
})

/**
 * Form fields table - represents an input field within a form
 */
export const formFields = sqliteTable('form_fields', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['text', 'textarea', 'date', 'radio', 'checkbox']
  }).notNull(),
  label: text('label').notNull(),
  placeholder: text('placeholder'),
  required: integer('required', { mode: 'boolean' }).notNull().default(0),
  options: text('options'), // JSON string for radio/checkbox options
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

/**
 * Form submissions table - represents a single submission of a published form
 */
export const formSubmissions = sqliteTable('form_submissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  data: text('data').notNull(), // JSON string of field values
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Type exports
export type Form = typeof forms.$inferSelect
export type NewForm = typeof forms.$inferInsert
export type FormField = typeof formFields.$inferSelect
export type NewFormField = typeof formFields.$inferInsert
export type FormSubmission = typeof formSubmissions.$inferSelect
export type NewFormSubmission = typeof formSubmissions.$inferInsert

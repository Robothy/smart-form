# Data Model: AI-Powered Form Builder

**Feature**: 001-ai-form-builder
**Date**: 2025-12-31
**Phase**: Phase 1 - Data Model Design

## Overview

This document defines the data model for the AI-powered form builder. The model consists of three primary entities: **Form**, **FormField**, and **FormSubmission**. The schema is designed for libSQL/SQLite with Drizzle ORM type-safe access.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│    Form     │───────│ FormField    │       │ FormSubmission  │
├─────────────┤ 1   N ├──────────────┤       ├─────────────────┤
│ id          │       │ id           │       │ id              │
│ title       │       │ formId       │       │ formId          │
│ status      │       │ type         │       │ data            │
│ slug        │       │ label        │       │ submittedAt     │
│ createdAt   │       │ required     │       │                 │
│ updatedAt   │       │ options      │       │                 │
│ publishedAt │       │ order        │       │                 │
└─────────────┘       └──────────────┘       └─────────────────┘
                                              │
                                              │ N
                                              │
                                              │ 1
                                              │
                                        ┌─────┴─────────────────────┐
                                        │ SubmissionData            │
                                        │ (JSON in FormSubmission)   │
                                        │ { fieldId: value }         │
                                        └───────────────────────────┘
```

---

## Entities

### Form

Represents a form with its metadata, status, and shareable link information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string (UUID) | PRIMARY KEY | Unique identifier for the form |
| `title` | string | NOT NULL, max 255 | Display title of the form |
| `status` | enum | NOT NULL, default: 'draft' | Form status: `draft` or `published` |
| `slug` | string | UNIQUE, nullable | Shareable URL slug (8 chars) |
| `description` | text | nullable | Optional form description |
| `createdAt` | timestamp | NOT NULL, default: now | Form creation timestamp |
| `updatedAt` | timestamp | NOT NULL, default: now | Last update timestamp |
| `publishedAt` | timestamp | nullable | When form was published |

**State Transitions**:
- `draft` → `published`: User publishes form (generates slug)
- `published` → No transitions allowed (forms cannot be unpublished)

**Validation Rules**:
- Title cannot be empty
- Slug must be unique (if set)
- Published forms cannot be edited

---

### FormField

Represents an input field within a form. Each field belongs to exactly one form.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string (UUID) | PRIMARY KEY | Unique identifier for the field |
| `formId` | string (UUID) | FOREIGN KEY → Form.id, NOT NULL | Parent form reference |
| `type` | enum | NOT NULL | Field type: `text`, `textarea`, `date`, `radio`, `checkbox` |
| `label` | string | NOT NULL, max 255 | Display label for the field |
| `placeholder` | string | nullable, max 500 | Placeholder text |
| `required` | boolean | NOT NULL, default: false | Whether field is required |
| `options` | text | nullable, JSON array | Options for radio/checkbox: `[{label, value}]` |
| `order` | integer | NOT NULL | Display order within form |
| `createdAt` | timestamp | NOT NULL, default: now | Field creation timestamp |
| `updatedAt` | timestamp | NOT NULL, default: now | Last update timestamp |

**Field Type Details**:

| Type | Options Required | Description |
|------|------------------|-------------|
| `text` | No | Single-line text input |
| `textarea` | No | Multi-line text input |
| `date` | No | Date picker |
| `radio` | Yes | Single-select radio buttons |
| `checkbox` | Yes | Multi-select checkboxes |

**Validation Rules**:
- `radio` and `checkbox` types require non-empty options array
- Options format: JSON array of `{label: string, value: string}`

---

### FormSubmission

Represents a single submission of a published form with all field values.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string (UUID) | PRIMARY KEY | Unique identifier for submission |
| `formId` | string (UUID) | FOREIGN KEY → Form.id, NOT NULL | Reference to submitted form |
| `data` | text | NOT NULL, JSON object | Field values: `{fieldId: value}` |
| `submittedAt` | timestamp | NOT NULL, default: now | Submission timestamp |

**Data Format**:
```json
{
  "fieldId1": "text value",
  "fieldId2": ["option1", "option2"],  // checkbox multi-select
  "fieldId3": "2025-12-31",             // date
  "fieldId4": null                      // optional field not filled
}
```

**Validation Rules**:
- All required fields must have non-null values
- Data must be valid JSON
- Form must be published to accept submissions

---

## Drizzle Schema Definition

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const forms = sqliteTable('forms', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  slug: text('slug').unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
})

export const formFields = sqliteTable('form_fields', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['text', 'textarea', 'date', 'radio', 'checkbox'] }).notNull(),
  label: text('label').notNull(),
  placeholder: text('placeholder'),
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  options: text('options'), // JSON string
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const formSubmissions = sqliteTable('form_submissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  data: text('data').notNull(), // JSON string
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Type exports
export type Form = typeof forms.$inferSelect
export type NewForm = typeof forms.$inferInsert
export type FormField = typeof formFields.$inferSelect
export type NewFormField = typeof formFields.$inferInsert
export type FormSubmission = typeof formSubmissions.$inferSelect
export type NewFormSubmission = typeof formSubmissions.$inferInsert
```

---

## Indexes

For performance, create the following indexes:

```sql
-- Index for slug-based lookups (shareable links)
CREATE INDEX idx_forms_slug ON forms(slug);

-- Index for submission lookups by form
CREATE INDEX idx_submissions_form_id ON form_submissions(formId);

-- Index for form list filtering by status
CREATE INDEX idx_forms_status ON forms(status);

-- Index for field ordering within forms
CREATE INDEX idx_fields_form_order ON form_fields(formId, order);
```

---

## Data Integrity Rules

### Foreign Key Constraints
- `formFields.formId` references `forms.id` with CASCADE delete
- `formSubmissions.formId` references `forms.id` with CASCADE delete

### Business Rules (Application Level)

1. **Draft forms can be edited** - Allow adding/removing/modifying fields
2. **Published forms are read-only** - Reject all mutation operations
3. **Slug is immutable** - Once published, slug cannot change
4. **Published forms require slug** - Generate unique slug on publish
5. **Empty forms cannot be published** - Require at least one field
6. **Submissions only for published forms** - Reject submissions to drafts
7. **Required fields must be filled** - Validate on submission

### Validation by Field Type

| Type | Validation |
|------|------------|
| `text` | Non-empty if required, max length 1000 |
| `textarea` | Non-empty if required, max length 10000 |
| `date` | Valid ISO date string if required |
| `radio` | Must match one of the defined options if required |
| `checkbox` | Array of values, all must match defined options if required |

---

## Migration Strategy

Use Drizzle Kit for schema management:

```bash
# Generate migration
drizzle-kit generate

# Apply migration
drizzle-kit push

# Open studio (optional GUI)
drizzle-kit studio
```

---

## Storage Estimates

**Per Form**:
- Base: ~200 bytes (form metadata)
- Per field: ~150 bytes (average)
- With 10 fields: ~1.7 KB

**Per Submission**:
- Base: ~100 bytes (metadata)
- Per field value: ~50 bytes (average)
- With 10 fields: ~600 bytes

**Total for 50 forms, 100 submissions each**:
- Forms: ~85 KB
- Submissions: ~3 MB
- Database file: ~5-10 MB (with indexes and overhead)

libSQL can handle this easily with the target scale.

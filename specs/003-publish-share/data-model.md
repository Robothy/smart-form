# Data Model: Publish Button and Share Link Display

**Feature**: 003-publish-share
**Date**: 2026-01-05

## Overview

This document describes the data model for the publish and share link functionality. The existing `forms` table already contains the necessary `slug` and `status` columns, so no schema migrations are required.

## Entities

### Form (Extended)

The `forms` table represents a form with metadata, status, and shareable link information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PRIMARY KEY | UUID identifier |
| title | text | NOT NULL | Form display title |
| status | enum('draft', 'published') | NOT NULL, DEFAULT 'draft' | Current form state |
| slug | text | UNIQUE | URL-friendly identifier for sharing (null when draft) |
| description | text | nullable | Optional form description |
| created_at | timestamp | NOT NULL, DEFAULT NOW | Creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW | Last update timestamp |
| published_at | timestamp | nullable | When form was published (null until published) |

**Key Changes**: No schema changes needed. The `slug` column already exists and is unique.

### FormField (Unchanged)

The `form_fields` table represents input fields within a form. No changes required.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PRIMARY KEY | UUID identifier |
| form_id | text | NOT NULL, FK → forms.id(id) | Parent form |
| type | enum('text', 'textarea', 'date', 'radio', 'checkbox') | NOT NULL | Field type |
| label | text | NOT NULL | Display label |
| placeholder | text | nullable | Placeholder text |
| required | boolean | NOT NULL, DEFAULT false | Whether field is required |
| options | text (JSON) | nullable | Options for radio/checkbox |
| order | integer | NOT NULL | Display order |
| created_at | timestamp | NOT NULL | Creation timestamp |
| updated_at | timestamp | NOT NULL | Update timestamp |

**Relationship**: One form has many formFields (CASCADE delete).

### FormSubmission (Unchanged)

The `form_submissions` table represents submitted responses to published forms. No changes required.

## State Transitions

### Form Lifecycle

```
┌─────────┐     publish()     ┌──────────────┐
│  Draft  │ ──────────────────>│  Published   │
│  Form   │                   │    Form      │
└─────────┘                   └──────────────┘
     │                               │
     │                               │ copy()
     │                               ▼
     │                          ┌─────────┐
     │                          │  Draft  │
     │                          │  Copy   │
     │                          └─────────┘
     │
     └──> [Deleted]
```

**Transition Rules**:

1. **Draft → Published** (publish action)
   - Precondition: Form has at least one field
   - Precondition: All fields are valid (required fields have labels)
   - Action: Generate unique slug, set status='published', set published_at=NOW
   - Postcondition: Form becomes immutable (no edits allowed)
   - Postcondition: Share link becomes accessible

2. **Published → Draft** (Not supported in this feature)
   - Future consideration: Unpublish action
   - Current behavior: Published forms stay published

3. **Published → Draft Copy** (copy action)
   - Action: Create new form with copied fields, status='draft', slug=null
   - New form has no reference to original
   - Original remains published and unchanged

## Validation Rules

### Publish Validation

Before allowing publish:

| Rule | Description | Error Message |
|------|-------------|---------------|
| HAS_FIELDS | Form must have at least one field | "Add at least one field before publishing" |
| VALID_FIELDS | All fields must have valid labels | "Fix invalid fields before publishing" |
| NOT_PUBLISHED | Form must not already be published | "Form is already published" |
| SLUG_AVAILABLE | Generated slug must be unique | Automatic retry with new suffix |

### Copy Validation

| Rule | Description | Error Message |
|------|-------------|---------------|
| FORM_EXISTS | Source form must exist | "Form not found" |
| COPY_SUCCESS | Copy operation must succeed | "Failed to copy form" |

## Slug Generation

### Algorithm

```typescript
function generateSlug(title: string): string {
  // Step 1: Convert title to URL-friendly base
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .trim();

  // Step 2: Ensure uniqueness with timestamp suffix
  const suffix = Date.now().toString(36); // Base36 for shorter string
  return `${base}-${suffix}`;
}
```

### Properties

| Property | Value | Description |
|----------|-------|-------------|
| Format | `{title}-{timestamp}` | Human-readable base with unique suffix |
| Length | Variable | Typically 20-60 characters |
| Characters | a-z, 0-9, hyphen | URL-safe only |
| Uniqueness | Guaranteed | Timestamp ensures no collisions |
| Case | Lowercase | Case-insensitive comparison |

### Example

```
Title: "Customer Feedback Survey"
Slug:  "customer-feedbacksurvey-1lk4x9m"  // timestamp appended
```

## Database Queries

### Publish Form

```sql
-- Single transaction: update status and generate slug
UPDATE forms
SET
  status = 'published',
  slug = ?,
  published_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE id = ?
  AND status = 'draft'
RETURNING *;
```

### Copy Form

```sql
-- Step 1: Copy form record
INSERT INTO forms (title, status, description)
SELECT 'Copy of ' || title, 'draft', description
FROM forms
WHERE id = ?
RETURNING *;

-- Step 2: Copy form fields
INSERT INTO form_fields (
  form_id, type, label, placeholder, required, options, `order`
)
SELECT
  ?, type, label, placeholder, required, options, `order`
FROM form_fields
WHERE form_id = ?
ORDER BY `order`;
```

### Get Published Form by Slug

```sql
SELECT * FROM forms
WHERE slug = ?
  AND status = 'published';
```

## Indexes

**Existing Indexes** (from current schema):

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | id | Primary key lookup |
| UNIQUE | slug | Share link lookup (critical for performance) |
| INDEX | status | Filter by draft/published |

**Recommended Additions** (if not present):

| Index | Columns | Purpose |
|-------|---------|---------|
| COMPOSITE | (status, created_at) | List forms with sorting |

## Data Integrity

### Constraints

1. **Slug Uniqueness**: Enforced by UNIQUE constraint on `slug` column
2. **Status Enum**: Only 'draft' or 'published' allowed
3. **Foreign Keys**: form_fields.form_id references forms.id with CASCADE delete
4. **Timestamps**: Automatic default for created_at, updated_at

### Transactions

All multi-step operations (publish, copy) MUST be wrapped in database transactions:

- Publish: Update status + slug + published_at atomically
- Copy: Insert form + fields atomically (or use batch insert)

## Security Considerations

### Slug Collision Handling

- Timestamp suffix makes collisions virtually impossible
- If collision occurs (same millisecond), add random component:
  ```typescript
  slug = `${base}-${timestamp}-${crypto.randomUUID().slice(0, 8)}`;
  ```

### Published Form Immutability

- Enforced at application level (API rejects updates to published forms)
- Database allows updates (for potential unpublish feature in future)
- UI redirects edit attempts to view page

### Access Control

- Published forms are publicly accessible via share link
- Only form creator can publish (single-user application)
- No authentication required to view published form

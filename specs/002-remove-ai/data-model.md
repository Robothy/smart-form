# Data Model: Remove AI Features

**Feature**: 002-remove-ai
**Date**: 2026-01-04
**Status**: No Changes

## Overview

This feature removes AI functionality from the application. No database schema changes are required because AI features were stateless and did not persist any data to the database.

## Database Schema

### No Changes Required

The existing database schema remains unchanged:

```sql
-- Forms table (unchanged)
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL, -- 'draft' or 'published'
  slug TEXT UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Form fields table (unchanged)
CREATE TABLE form_fields (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'text', 'textarea', 'date', 'radio', 'checkbox'
  label TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  options TEXT, -- JSON array for radio/checkbox options
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

-- Form submissions table (unchanged)
CREATE TABLE form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data TEXT NOT NULL, -- JSON object with field values
  submitted_at TEXT NOT NULL
);
```

## Removed Entities

The following AI-related entities were in-memory only and are being removed:

| Entity | Type | Description |
|--------|------|-------------|
| AIAssistant | UI Component | Form design assistant (no DB storage) |
| FillAssistant | UI Component | Form filling assistant (no DB storage) |
| CopilotProvider | Context Provider | AI context provider (no DB storage) |
| AI messages | Session state | Transient chat messages (not persisted) |

## Validation

No changes to validation schemas. The existing Zod schemas for forms, fields, and submissions remain unchanged.

**No database migrations required for this feature.**

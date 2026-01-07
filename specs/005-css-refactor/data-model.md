# Data Model: CSS Centralization and Theme Reuse

**Feature**: 005-css-refactor
**Date**: 2026-01-06
**Status**: No Data Changes

## Overview

This feature is a **code refactoring** that centralizes inline CSS styles. It does not introduce new data entities, modify database schemas, or change data persistence patterns.

## Data Impact: NONE

### No Database Changes

- No new tables
- No modified tables
- No new migrations
- No changes to `lib/db/schema.ts`

### No API Changes

- No new endpoints
- No modified request/response schemas
- No changes to `lib/validation/schemas.ts`

## What Changes: Code Structure

This feature introduces **theme constants** as TypeScript modules. These are compile-time constructs, not runtime data structures.

### New File Structure

```text
lib/theme/
├── index.ts           # Main export file for theme constants
├── colors.ts          # Color value constants
├── gradients.ts       # Gradient definitions
├── spacing.ts         # Spacing scale constants
├── shadows.ts         # Shadow definitions
└── components.ts      # Component style compositions
```

### Type Definitions (Compile-Time Only)

The theme constants are typed using MUI's `SxProps<Theme>` type:

```typescript
import { SxProps } from '@mui/material/styles';

// Example: Button style constant
export const buttonStyles: Record<ButtonVariant, SxProps<Theme>> = {
  primary: { /* style object */ },
  secondary: { /* style object */ },
};
```

These types exist **only at compile time** and are erased from the JavaScript output. They provide IDE autocomplete and type safety but do not affect runtime data structures.

## Existing Data Entities (Unchanged)

The following existing database entities remain unchanged by this feature:

### Forms Table
- `id` (string, primary key)
- `name` (string)
- `slug` (string, unique)
- `description` (string, nullable)
- `status` ('draft' | 'published')
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### FormFields Table
- `id` (string, primary key)
- `formId` (string, foreign key → forms.id)
- `label` (string)
- `type` (enum)
- `required` (boolean)
- `options` (json, nullable)
- `order` (integer)

### FormSubmissions Table
- `id` (string, primary key)
- `formId` (string, foreign key → forms.id)
- `data` (json)
- `submittedAt` (timestamp)

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Database Schema | No changes | Existing tables unchanged |
| API Endpoints | No changes | No new or modified routes |
| Validation Schemas | No changes | Existing Zod schemas unchanged |
| TypeScript Types | New types added | Theme constant types (compile-time only) |
| Runtime Data | No changes | Pure refactoring, no data model impact |

## Conclusion

This feature is a **developer experience improvement** that reduces code duplication and improves maintainability. It has zero impact on the application's data model, API surface, or runtime behavior.

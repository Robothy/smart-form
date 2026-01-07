# Quickstart Guide: Form Management Improvements

**Feature**: 004-form-management-improvements
**Date**: 2026-01-05

## Prerequisites

- Node.js 18+
- npm or pnpm
- libSQL database at `data/simple-form.db`

## Installation

No new dependencies required. This feature uses existing stack:
- Next.js 15.1
- React 19
- MUI v6
- Drizzle ORM 0.36
- Zod 3.24

## Database Setup

Ensure cascade delete is configured in the schema:

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer, uuid } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const forms = sqliteTable('forms', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  slug: text('slug').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const formFields = sqliteTable('form_fields', {
  id: uuid('id').primaryKey(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  type: text('type', { enum: ['text', 'textarea', 'date', 'select', 'checkbox', 'radio'] }).notNull(),
  label: text('label').notNull(),
  placeholder: text('placeholder'),
  options: text('options', { mode: 'json' }),
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const formSubmissions = sqliteTable('form_submissions', {
  id: uuid('id').primaryKey(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Run Database Migrations

```bash
npm run db:push
```

### 3. Run Type Checks

```bash
npm run type-check
```

### 4. Run Linter

```bash
npm run lint
```

## Key Files to Modify

| File | Changes |
|------|---------|
| `app/forms/page.tsx` | Add delete button to form list |
| `app/forms/[id]/page.tsx` | Add delete button to detail view |
| `app/forms/[id]/submissions/page.tsx` | Create submissions grid view |
| `app/forms/[id]/edit/page.tsx` | Add sticky toolbar, move Add Field button |
| `app/layout.tsx` | Improve navigation bar |
| `lib/api/forms.ts` | Add deleteForm, getSubmissions endpoints |
| `components/forms/FormList.tsx` | Add delete confirmation dialog |
| `components/forms/SubmissionGrid.tsx` | New component for grid view |
| `components/forms/EditToolbar.tsx` | New sticky toolbar component |
| `components/forms/NavBar.tsx` | Enhanced navigation |

## Component Quick Reference

### Delete Confirmation Dialog

```tsx
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Delete Form?</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete "{formName}"? This will permanently remove
      the form, all fields, and {submissionCount} submission(s).
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} color="error">Delete</Button>
  </DialogActions>
</Dialog>
```

### Sticky Toolbar

```tsx
<Box sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: 'background.paper' }}>
  <Toolbar>
    <Button onClick={handleSave}>Save Changes</Button>
    <Button onClick={handlePublish} variant="contained">Publish</Button>
  </Toolbar>
</Box>
```

### Submissions Grid (MUI DataGrid)

```tsx
import { DataGrid } from '@mui/x-dataGrid';

const columns: GridColDef[] = fields.map(f => ({
  field: f.id,
  headerName: f.label,
  width: 200,
  renderCell: (params) => (
    <Tooltip title={params.value}>
      <span>{truncate(String(params.value), 50)}</span>
    </Tooltip>
  ),
}));

<DataGrid rows={submissions} columns={columns} autoHeight />
```

## Testing

### Unit Tests

```bash
npm run test
```

### Component Tests

Test the following:
- Delete confirmation dialog appears and cancels correctly
- Delete action removes form from list
- Sticky toolbar remains visible on scroll
- Submission grid displays all columns correctly
- Navigation active states update correctly

## Deployment

1. Push to branch `004-form-management-improvements`
2. Create PR and ensure CI passes
3. Merge to main
4. Deploy via existing pipeline

## Rollback

If issues arise:
1. Revert database schema changes via migration
2. Rollback code changes via git revert

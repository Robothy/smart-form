# Research: Form Management Improvements

**Feature**: 004-form-management-improvements
**Date**: 2026-01-05

## Delete Functionality

### Database Cascade Deletion

**Decision**: Use Drizzle ORM foreign key cascade delete

**Rationale**: The project already uses Drizzle ORM with libSQL. The database schema should define foreign keys with `ON DELETE CASCADE` to automatically delete related records when a parent record is deleted.

**Implementation**:
```typescript
// In lib/db/schema.ts
export const formFields = pgTable('form_fields', {
  formId: integer('form_id').references(() => forms.id, { onDelete: 'cascade' }),
  // ... other fields
});

export const formSubmissions = pgTable('form_submissions', {
  formId: integer('form_id').references(() => forms.id, { onDelete: 'cascade' }),
  // ... other fields
});
```

**Rationale**:
- Native database cascade is most reliable (no application-level race conditions)
- Drizzle ORM supports `onDelete: 'cascade'` for SQLite/libSQL
- Transactional integrity maintained by the database
- Simpler than application-level cascade deletion

**Alternatives Considered**:
1. Application-level cascade deletion - Rejected: More error-prone, requires transaction management
2. Soft delete with flags - Rejected: Not requested, adds complexity for this feature

### Confirmation Dialog

**Decision**: Use MUI Dialog component with confirmation workflow

**Rationale**: The project uses MUI v6. The existing patterns should be followed for dialogs.

**Implementation Pattern**:
```typescript
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Delete Form?</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete "{formName}"? This will permanently remove
      the form, all fields, and {submissionCount} submission(s). This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} color="error" autoFocus>Delete</Button>
  </DialogActions>
</Dialog>
```

**Rationale**:
- Clear warning about data loss
- Shows form name to prevent accidental deletion
- Shows submission count for context
- "Delete" button uses error color for visual distinction
- `autoFocus` on Delete button prevents accidental confirm

## Submissions Grid View

### Table Implementation

**Decision**: Use MUI DataGrid (MUI X DataGrid) for submissions display

**Rationale**:
- MUI X DataGrid provides sorting, pagination, column resizing out of the box
- Supports horizontal and vertical scrolling
- Handles large datasets with virtualization
- Consistent with MUI v6 usage in project

**Alternatives Considered**:
1. Custom HTML table - Rejected: Would require implementing sorting, pagination, scrolling
2. TanStack Table - Rejected: Adds new dependency, MUI DataGrid already available

**Implementation**:
```typescript
import { DataGrid } from '@mui/x-data-grid';

const columns: GridColDef[] = formFields.map(field => ({
  field: field.label,
  headerName: field.label,
  width: 200,
  renderCell: (params) => (
    <Tooltip title={params.value?.length > 50 ? params.value : ''}>
      <span>{truncate(params.value, 50)}</span>
    </Tooltip>
  )
}));

// Add action column for view/edit
columns.push({
  field: 'actions',
  headerName: 'Actions',
  width: 100,
  renderCell: (params) => <Button>View</Button>
});

<DataGrid
  rows={submissions}
  columns={columns}
  autoHeight
  disableRowSelectionOnClick
/>
```

**Performance Consideration**: For 500 submissions, DataGrid virtualization will handle rendering efficiently.

## Sticky Toolbar

### CSS Implementation

**Decision**: Use CSS `position: sticky` with MUI AppBar

**Implementation**:
```typescript
<Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
  <AppBar position="static">
    <Toolbar>
      <Button onClick={handleSave}>Save Changes</Button>
      <Button onClick={handlePublish}>Publish</Button>
    </Toolbar>
  </AppBar>
</Box>
```

**Rationale**:
- `position: sticky` is native CSS, no JavaScript needed
- Works with MUI AppBar component
- Z-index ensures toolbar stays above form fields during scroll
- Simple and performant (no scroll event listeners)

**Alternative**: `position: fixed` - Rejected: Requires handling width and transform, more complex

### Add Field Button Location

**Decision**: Place Add Field button in a fixed footer at bottom of edit page

**Implementation**: Create a dedicated footer area that always shows the Add Field button:
```typescript
<Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'background.paper' }}>
  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddField}>
    Add Field
  </Button>
</Box>
```

**Consideration**: Need to account for toolbar height to avoid overlap with sticky toolbar.

## Navigation Bar Enhancement

### Active State Implementation

**Decision**: Use React Router/Next.js usePathname hook for active state

**Implementation Pattern**:
```typescript
const navItems = [
  { label: 'Forms', href: '/forms' },
  { label: 'New Form', href: '/forms/new' },
];

<BottomNavigation value={pathname} onChange={handleChange}>
  {navItems.map(item => (
    <BottomNavigationAction
      value={item.href}
      label={item.label}
      icon={item.icon}
      component={Link}
      href={item.href}
    />
  ))}
</BottomNavigation>
```

**Rationale**:
- Clear visual indicator of current location
- Consistent with MUI BottomNavigation patterns
- Accessible via keyboard navigation
- Mobile-responsive

**Alternative**: Breadcrumb-style nav - Rejected: BottomNavigation better for frequent navigation between forms

## API Design

### Delete Endpoint

**Decision**: DELETE `/api/forms/[id]`

**Response**:
```json
{
  "success": true,
  "data": { "message": "Form deleted successfully" }
}
```

**Error Responses**:
- 404: Form not found
- 500: Server error during deletion

### Submissions Endpoint (for grid)

**Decision**: GET `/api/forms/[id]/submissions`

**Query Params**: `page=1&pageSize=50&sortField=createdAt&sortDir=desc`

**Response**:
```json
{
  "success": true,
  "data": {
    "submissions": [...],
    "total": 150,
    "page": 1,
    "pageSize": 50
  }
}
```

## Open Questions (Resolved)

| Question | Resolution | Rationale |
|----------|------------|-----------|
| Cascade delete implementation | Database foreign keys | Native, reliable, transaction-safe |
| Grid pagination | Server-side | Consistent with existing API pattern |
| Toolbar positioning | CSS sticky | Native CSS, no JS overhead |
| Confirmation dialog | MUI Dialog | Existing dependency, consistent UX |

# Research: Publish Button and Share Link Display

**Feature**: 003-publish-share
**Date**: 2026-01-05
**Status**: Complete

## Overview

This document summarizes research findings for implementing the publish button and share link display feature. The existing codebase already has a forms table with a `slug` column, reducing schema changes needed.

## Key Decisions

### 1. Slug Generation Strategy

**Decision**: Use title-based slug generation with collision handling via timestamp suffix.

**Rationale**:
- Title-based slugs are user-friendly and memorable (e.g., "customer-feedback" vs "abc123")
- Existing `forms.slug` column is a unique text field, perfect for URL-friendly identifiers
- Timestamp suffix (ISO format) ensures uniqueness while being sortable
- No external dependencies needed - can use built-in `crypto.randomUUID()` for fallback

**Alternatives Considered**:
- UUID-only slugs: Rejected as not user-friendly for sharing
- Sequential numeric IDs: Rejected as leaks information about form count
- Random alphanumeric strings: Rejected as harder to remember/share

**Implementation Approach**:
```typescript
// lib/utils/slug.ts
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .trim();

  // Check uniqueness, append timestamp suffix if needed
  return base + '-' + Date.now().toString(36);
}
```

### 2. Publish API Endpoint Design

**Decision**: POST endpoint at `/api/forms/[id]/publish` with atomic status and slug update.

**Rationale**:
- RESTful convention: POST for state-changing actions
- Single transaction ensures status and slug are updated atomically
- Returns the updated form with full details including slug
- Consistent with existing API patterns in the codebase

**Alternatives Considered**:
- PUT endpoint: Rejected as PUT typically implies full resource replacement
- GraphQL mutation: Rejected as codebase uses REST API routes
- Client-side slug generation: Rejected as doesn't guarantee uniqueness

**API Contract**:
```typescript
POST /api/forms/[id]/publish

Request: {}
Response: {
  success: true,
  data: {
    id: string,
    title: string,
    status: 'published',
    slug: string,
    shareUrl: string
  }
}

Errors:
- 400: Form has no fields
- 400: Form already published
- 404: Form not found
- 500: Slug generation failure
```

### 3. Published Form Immutability

**Decision**: Enforce immutability at UI level (redirect edit to view) and API level (reject updates).

**Rationale**:
- Database-level enforcement would require complex triggers
- UI-level enforcement provides better user experience (friendly redirect)
- API-level validation prevents accidental updates via direct API calls
- Allows future "unpublish" feature if needed

**Implementation Approach**:
- `app/forms/[id]/edit/page.tsx`: Check form status, redirect to view if published
- API update endpoints: Return 400 if attempting to update published form
- Add "Copy Form" button on published form detail page

### 4. Share Link Display Pattern

**Decision**: Use share icon button with Menu/Popover popup for form list; inline display with copy button for detail page.

**Rationale**:
- Form list: Icon button keeps UI compact, popup shows full URL on demand
- Detail page: Inline display makes the link immediately visible and accessible
- Copy-to-clipboard uses Navigator Clipboard API with fallback for older browsers
- Visual confirmation (toast/snackbar) after copy action

**Alternatives Considered**:
- Always show full URL in list: Rejected as creates visual clutter
- Use QR code: Rejected as out of scope for this feature
- Email/share integration: Rejected as out of scope, browser share API sufficient

### 5. Form Copy Functionality

**Decision**: Create independent copy with new ID and draft status, no reference to original.

**Rationale**:
- Simpler data model (no parent/child relationship)
- User clarified copies should be completely independent
- Allows deletion of original without affecting copies
- New slug generated when copy is published

**API Contract**:
```typescript
POST /api/forms/[id]/copy

Request: {}
Response: {
  success: true,
  data: {
    id: string,
    title: string, // "Copy of [original title]"
    status: 'draft',
    slug: null
  }
}
```

## Technology Choices

### Clipboard API

**Decision**: Use `navigator.clipboard.writeText()` with `execCommand()` fallback.

**Rationale**:
- Modern browser API with better permissions handling
- Fallback ensures compatibility with older browsers
- No external dependencies needed

**Reference**: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

### URL Construction

**Decision**: Use Next.js `URL` constructor with `window.location.origin` for base URL.

**Rationale**:
- Handles both development and production environments
- More reliable than hardcoded base URLs
- Consistent with existing share link pattern at `/forms/share/[slug]`

## Best Practices

### Form Validation

- **Client-side**: Validate form has at least one field before enabling publish button
- **Server-side**: Re-validate in API endpoint to prevent bypass
- **Error messages**: Specific and actionable ("Add at least one field before publishing")

### Loading States

- Disable publish button during API call
- Show loading spinner on button
- Prevent duplicate submissions

### Responsive Design

- Share icon button: Use standard MUI IconButton size
- Popup/Popover: Position intelligently (avoid edge overflow)
- Mobile: Stack controls vertically if needed

## Dependencies

No new dependencies required. All functionality can be implemented with:
- Next.js 15.1 (API routes, redirects)
- React 19 (client components)
- MUI v6 (Button, IconButton, Menu, Popover, Snackbar)
- Drizzle ORM 0.36 (database queries)
- Zod 3.24 (validation)

## References

- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- MUI Button Component: https://mui.com/material-ui/react-button/
- MUI Popover: https://mui.com/material-ui/react-popover/
- Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- URL Slug Best Practices: https://blog.zwart.it/2017/01/20/urls-are-ui.html

# Quickstart Guide: Publish Button and Share Link Display

**Feature**: 003-publish-share
**Date**: 2026-01-05

## Overview

This guide helps developers understand how to use the new publish and share functionality. It covers user workflows, API usage, and component integration.

## User Workflows

### Publishing a Form

1. Navigate to the form edit page (`/forms/[id]/edit`)
2. Add at least one field to the form
3. Click the **Publish** button at the top of the page
4. Form is published and you're redirected to the read-only detail view
5. Share link is displayed at the top of the detail page

### Sharing a Published Form

**From Detail Page**:
1. Navigate to a published form's detail view (`/forms/[id]/view`)
2. The share link is displayed at the top of the page
3. Click the **Copy** button next to the link
4. Confirmation message appears: "Link copied to clipboard"

**From Form List**:
1. Navigate to the form list (`/forms`)
2. Find the published form (shows share icon button)
3. Click the share icon button
4. Popup/dropdown shows the full share link
5. Click **Copy** to copy the link

### Accessing a Shared Form

1. User opens the share link: `https://example.com/forms/share/[slug]`
2. Form displays in fill mode (public access, no authentication)
3. User fills out the form and submits

### Copying a Published Form

1. Navigate to a published form's detail view
2. Click the **Copy Form** button at the top of the page
3. A new draft form is created with all fields copied
4. You're redirected to edit the new draft

## API Usage

### Publish a Form

```typescript
// Client-side example
async function publishForm(formId: string) {
  const response = await fetch(`/api/forms/${formId}/publish`, {
    method: 'POST',
  });

  const result = await response.json();

  if (result.success) {
    console.log('Published:', result.data.shareUrl);
    // Redirect to detail view
    router.push(`/forms/${formId}/view`);
  } else {
    console.error('Error:', result.error);
  }
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Customer Feedback",
    "status": "published",
    "slug": "customer-feedback-1lk4x9m",
    "shareUrl": "https://example.com/forms/share/customer-feedback-1lk4x9m",
    "publishedAt": "2026-01-05T10:30:00Z",
    "fieldCount": 5
  }
}
```

### Copy a Form

```typescript
// Client-side example
async function copyForm(formId: string) {
  const response = await fetch(`/api/forms/${formId}/copy`, {
    method: 'POST',
  });

  const result = await response.json();

  if (result.success) {
    console.log('Copied:', result.data.id);
    // Redirect to edit the new copy
    router.push(`/forms/${result.data.id}/edit`);
  }
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "987fcdeb-51a2-43f1-a456-426614174000",
    "title": "Copy of Customer Feedback",
    "status": "draft",
    "slug": null,
    "fieldCount": 5
  }
}
```

## Component Integration

### PublishButton Component

```typescript
import { PublishButton } from '@/components/forms/PublishButton';

// In form edit page
<PublishButton
  formId={form.id}
  fieldCount={form.fields.length}
  onPublished={(data) => {
    // Handle successful publish
    router.push(`/forms/${form.id}/view`);
  }}
  onError={(error) => {
    // Handle error
    alert(error);
  }}
/>
```

**Props**:
- `formId`: string - The form ID to publish
- `fieldCount`: number - Number of fields (for validation)
- `onPublished`: (data: PublishedForm) => void - Success callback
- `onError`: (error: string) => void - Error callback

### ShareLinkDisplay Component

```typescript
import { ShareLinkDisplay } from '@/components/forms/ShareLinkDisplay';

// In form detail page
<ShareLinkDisplay
  slug={form.slug}
  shareUrl={`${origin}/forms/share/${form.slug}`}
/>
```

**Props**:
- `slug`: string - The form's share slug
- `shareUrl`: string - Complete shareable URL

### ShareIconButton Component

```typescript
import { ShareIconButton } from '@/components/forms/ShareIconButton';

// In form list
<ShareIconButton
  slug={form.slug}
  shareUrl={`${origin}/forms/share/${form.slug}`}
/>
```

**Props**:
- `slug`: string - The form's share slug
- `shareUrl`: string - Complete shareable URL

## Utility Functions

### Slug Generation

```typescript
import { generateSlug } from '@/lib/utils/slug';

// Generate a unique slug from a title
const slug = generateSlug('Customer Feedback Survey');
// Returns: "customer-feedbacksurvey-1lk4x9m"
```

### Clipboard Copy

```typescript
import { copyToClipboard } from '@/lib/utils/clipboard';

// Copy text to clipboard with fallback
await copyToClipboard('https://example.com/forms/share/abc123');
// Returns: true if successful, false if failed
```

## Validation

### Before Publishing

Client-side validation before enabling the publish button:

```typescript
import { publishFormSchema } from '@/lib/validation/forms';

// Validate form before publishing
const result = publishFormSchema.safeParse({
  fieldCount: form.fields.length,
  status: form.status,
});

if (!result.success) {
  // Show validation errors
  console.error(result.errors);
  // Don't enable publish button
}
```

**Validation Rules**:
- Form must have at least one field (`fieldCount >= 1`)
- Form must be in draft status (`status === 'draft'`)

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Add at least one field before publishing" | Form has no fields | Add at least one field |
| "Form is already published" | Attempting to publish an already published form | Redirect to view page |
| "Fix invalid fields before publishing" | Fields have validation errors | Fix field labels/config |
| "Failed to generate unique slug" | Database collision (rare) | Retry publish action |

### Error Display

```typescript
// Example error handling
function handlePublishError(error: string) {
  switch (error) {
    case 'Add at least one field before publishing':
      return 'Please add at least one field before publishing.';
    case 'Form is already published':
      return 'This form is already published.';
    case 'Fix invalid fields before publishing':
      return 'Please fix invalid fields before publishing.';
    default:
      return 'An error occurred. Please try again.';
  }
}
```

## URL Patterns

| Purpose | Pattern | Example |
|---------|---------|---------|
| Edit form | `/forms/[id]/edit` | `/forms/abc123/edit` |
| View form (detail) | `/forms/[id]/view` | `/forms/abc123/view` |
| Share form (public) | `/forms/share/[slug]` | `/forms/share/customer-feedback-1lk4x9m` |
| Publish API | `/api/forms/[id]/publish` | `/api/forms/abc123/publish` |
| Copy API | `/api/forms/[id]/copy` | `/api/forms/abc123/copy` |

## Development Checklist

- [ ] Install dependencies (no new packages needed)
- [ ] Create `lib/utils/slug.ts` for slug generation
- [ ] Create `lib/utils/clipboard.ts` for clipboard operations
- [ ] Create `lib/validation/forms.ts` with publish validation schema
- [ ] Create API route: `app/api/forms/[id]/publish/route.ts`
- [ ] Create API route: `app/api/forms/[id]/copy/route.ts`
- [ ] Create component: `components/forms/PublishButton.tsx`
- [ ] Create component: `components/forms/ShareLinkDisplay.tsx`
- [ ] Create component: `components/forms/ShareIconButton.tsx`
- [ ] Modify: `app/forms/[id]/edit/page.tsx` (add publish button)
- [ ] Modify: `app/forms/[id]/view/page.tsx` (add share link, copy button, read-only styling)
- [ ] Modify: `app/forms/page.tsx` (add share icon button)
- [ ] Test: Publish a form with no fields (should fail)
- [ ] Test: Publish a form with fields (should succeed)
- [ ] Test: Access edit page for published form (should redirect)
- [ ] Test: Copy a published form
- [ ] Test: Share link copy functionality

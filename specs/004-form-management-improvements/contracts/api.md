# API Contracts: Form Management Improvements

**Feature**: 004-form-management-improvements
**Date**: 2026-01-05

## Overview

This document defines the API contracts for form management features:
- Delete form endpoint
- Submissions list endpoint (grid view)

## API Response Format

All API responses follow this standardized format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## DELETE /api/forms/[id]

Delete a form and all associated fields and submissions.

### Request

**Method**: DELETE
**Path**: `/api/forms/[id]`
**Authentication**: Required (session-based)

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Form ID to delete |

### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "message": "Form deleted successfully"
  }
}
```

**Error Responses**:

| Status | Code | Message |
|--------|------|---------|
| 400 | INVALID_ID | Invalid form ID format |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot delete this form |
| 404 | NOT_FOUND | Form not found |
| 500 | INTERNAL_ERROR | Server error during deletion |

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Form not found"
  }
}
```

### Implementation Notes

- Uses database cascade delete to remove fields and submissions
- Returns immediately after initiating delete (fast response)
- No body required in request

---

## GET /api/forms/[id]/submissions

Retrieve submissions for a form in a format suitable for grid display.

### Request

**Method**: GET
**Path**: `/api/forms/[id]/submissions`
**Authentication**: Required (session-based)

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Form ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (1-indexed) |
| pageSize | integer | 50 | Number of items per page (max 100) |
| sortField | string | 'created_at' | Field to sort by |
| sortDir | 'asc' \| 'desc' | 'desc' | Sort direction |
| search | string | '' | Search term for filtering |

### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid-1",
        "formId": "uuid-form",
        "data": {
          "field-uuid-1": "John",
          "field-uuid-2": "john@example.com"
        },
        "createdAt": "2026-01-05T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 50,
    "totalPages": 3
  }
}
```

**Submission Data Structure**:
```typescript
interface SubmissionData {
  id: string;
  formId: string;
  data: Record<string, string | number | boolean>;
  createdAt: string; // ISO 8601
}
```

**Error Responses**:

| Status | Code | Message |
|--------|------|---------|
| 400 | INVALID_ID | Invalid form ID format |
| 400 | INVALID_PARAMS | Invalid query parameters |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot view submissions for this form |
| 404 | NOT_FOUND | Form not found |
| 500 | INTERNAL_ERROR | Server error |

### Implementation Notes

- Returns data in flat structure for grid display
- Field values keyed by field ID for consistency
- Supports pagination for large datasets
- Total count included for grid pagination UI

---

## GET /api/forms/[id]/fields

Retrieve form fields for building grid column headers.

### Request

**Method**: GET
**Path**: `/api/forms/[id]/fields`
**Authentication**: Required (session-based)

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Form ID |

### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "id": "field-uuid-1",
        "label": "Full Name",
        "type": "text",
        "required": true
      },
      {
        "id": "field-uuid-2",
        "label": "Email",
        "type": "text",
        "required": true
      }
    ]
  }
}
```

**Field Structure**:
```typescript
interface GridField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'checkbox' | 'radio';
  required: boolean;
}
```

---

## Frontend API Client

### TypeScript Interface

```typescript
interface FormApi {
  deleteForm(id: string): Promise<ApiResponse<{ message: string }>>;
  getSubmissions(
    formId: string,
    params?: SubmissionListParams
  ): Promise<ApiResponse<SubmissionListResponse>>;
  getFormFields(formId: string): Promise<ApiResponse<{ fields: GridField[] }>>;
}

interface SubmissionListParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

interface SubmissionListResponse {
  submissions: SubmissionData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Implementation Example

```typescript
// lib/api/forms.ts
import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./data/simple-form.db' });

export async function deleteForm(id: string) {
  try {
    await client.execute({
      sql: 'DELETE FROM forms WHERE id = ?',
      args: [id],
    });
    return { success: true, data: { message: 'Form deleted successfully' } };
  } catch (error) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
```

---

## Error Handling Strategy

### Client-Side

- Display user-friendly error messages from `error.message`
- Show toast notifications for delete confirmation
- Handle 401 by redirecting to login
- Handle 404 by showing "Form not found" state

### Server-Side

- Log all errors with request context
- Return appropriate HTTP status codes
- Never expose internal error details to client
- Use transactions for delete operation to ensure atomicity

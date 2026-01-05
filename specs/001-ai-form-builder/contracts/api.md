# API Contracts: AI-Powered Form Builder

**Feature**: 001-ai-form-builder
**Date**: 2025-12-31
**Phase**: Phase 1 - API Contracts

## Overview

This document defines the REST API contracts for the AI-powered form builder. All endpoints follow REST conventions with standard HTTP methods and status codes.

---

## Base URL

```
http://localhost:3000/api
```

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email must contain @",
    "details": { ... }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `FORBIDDEN` | 403 | Operation not allowed (e.g., editing published form) |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Forms API

### GET /api/forms

**Purpose**: List all forms with optional filtering

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | null | Filter by status: `draft` or `published` |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Customer Feedback",
      "status": "draft",
      "slug": null,
      "description": "Collect customer feedback",
      "createdAt": "2025-12-31T10:00:00Z",
      "updatedAt": "2025-12-31T10:00:00Z",
      "publishedAt": null,
      "fieldsCount": 5,
      "submissionsCount": 0
    }
  ]
}
```

---

### POST /api/forms

**Purpose**: Create a new form

**Request Body**:

```json
{
  "title": "Customer Feedback",
  "description": "Collect customer feedback on our products"
}
```

**Validation**:
- `title`: Required, max 255 characters
- `description`: Optional, max 1000 characters

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Customer Feedback",
    "status": "draft",
    "slug": null,
    "description": "Collect customer feedback",
    "createdAt": "2025-12-31T10:00:00Z",
    "updatedAt": "2025-12-31T10:00:00Z",
    "publishedAt": null,
    "fields": []
  }
}
```

---

### GET /api/forms/:id

**Purpose**: Get form details by ID

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Customer Feedback",
    "status": "draft",
    "slug": null,
    "description": "Collect customer feedback",
    "createdAt": "2025-12-31T10:00:00Z",
    "updatedAt": "2025-12-31T10:00:00Z",
    "publishedAt": null,
    "fields": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "formId": "550e8400-e29b-41d4-a716-446655440000",
        "type": "text",
        "label": "Your Name",
        "placeholder": "Enter your name",
        "required": true,
        "options": null,
        "order": 1,
        "createdAt": "2025-12-31T10:00:00Z",
        "updatedAt": "2025-12-31T10:00:00Z"
      }
    ]
  }
}
```

---

### PUT /api/forms/:id

**Purpose**: Update form metadata

**Request Body**:

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Validation**:
- Form must be in `draft` status
- Same validation rules as create

**Response**: Same as GET /api/forms/:id

---

### DELETE /api/forms/:id

**Purpose**: Delete a form

**Validation**:
- Form must be in `draft` status

**Response**:

```json
{
  "success": true,
  "data": {
    "message": "Form deleted successfully"
  }
}
```

---

### POST /api/forms/:id/publish

**Purpose**: Publish a form (generate shareable link)

**Validation**:
- Form must be in `draft` status
- Form must have at least one field

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Customer Feedback",
    "status": "published",
    "slug": "abc123xy",
    "description": "Collect customer feedback",
    "createdAt": "2025-12-31T10:00:00Z",
    "updatedAt": "2025-12-31T10:05:00Z",
    "publishedAt": "2025-12-31T10:05:00Z",
    "shareableLink": "http://localhost:3000/forms/share/abc123xy"
  }
}
```

---

## Form Fields API

### POST /api/forms/:id/fields

**Purpose**: Add a field to a form

**Request Body**:

```json
{
  "type": "text",
  "label": "Your Name",
  "placeholder": "Enter your name",
  "required": true,
  "options": null,
  "order": 1
}
```

**Validation**:
- Form must be in `draft` status
- `type`: Required, one of `text`, `textarea`, `date`, `radio`, `checkbox`
- `label`: Required, max 255 characters
- `placeholder`: Optional, max 500 characters
- `required`: Required, boolean
- `options`: Required for `radio` and `checkbox` types, JSON array of `{label, value}`
- `order`: Required, positive integer

**Example for radio field**:

```json
{
  "type": "radio",
  "label": "Rating",
  "placeholder": null,
  "required": true,
  "options": [
    {"label": "Excellent", "value": "excellent"},
    {"label": "Good", "value": "good"},
    {"label": "Fair", "value": "fair"},
    {"label": "Poor", "value": "poor"}
  ],
  "order": 2
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "formId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "text",
    "label": "Your Name",
    "placeholder": "Enter your name",
    "required": true,
    "options": null,
    "order": 1,
    "createdAt": "2025-12-31T10:00:00Z",
    "updatedAt": "2025-12-31T10:00:00Z"
  }
}
```

---

### PUT /api/forms/:id/fields/:fieldId

**Purpose**: Update a field

**Request Body**:

```json
{
  "label": "Your Full Name",
  "required": true
}
```

**Validation**:
- Form must be in `draft` status

**Response**: Same as POST /api/forms/:id/fields

---

### DELETE /api/forms/:id/fields/:fieldId

**Purpose**: Delete a field

**Validation**:
- Form must be in `draft` status

**Response**:

```json
{
  "success": true,
  "data": {
    "message": "Field deleted successfully"
  }
}
```

---

## Form Submissions API

### GET /api/forms/:id/submissions

**Purpose**: List submissions for a form

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `limit` | integer | No | 20 | Items per page |

**Validation**:
- Form must be in `published` status

**Response**:

```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "formId": "550e8400-e29b-41d4-a716-446655440000",
        "data": {
          "660e8400-e29b-41d4-a716-446655440001": "John Doe",
          "660e8400-e29b-41d4-a716-446655440002": "Great product!"
        },
        "submittedAt": "2025-12-31T11:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### POST /api/forms/:id/submissions

**Purpose**: Submit a form

**Request Body**:

```json
{
  "data": {
    "660e8400-e29b-41d4-a716-446655440001": "John Doe",
    "660e8400-e29b-41d4-a716-446655440002": "Great product!"
  }
}
```

**Validation**:
- Form must be in `published` status
- All required fields must have non-null values
- Values must match field type constraints:
  - `text`: Max 1000 characters
  - `textarea`: Max 10000 characters
  - `date`: Valid ISO date string
  - `radio`: Must match one of defined options
  - `checkbox`: Array of values, all must match defined options

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "formId": "550e8400-e29b-41d4-a716-446655440000",
    "submittedAt": "2025-12-31T11:00:00Z"
  }
}
```

**Error Response Example**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Required field 'Your Name' is missing",
    "details": {
      "fieldId": "660e8400-e29b-41d4-a716-446655440001",
      "fieldLabel": "Your Name",
      "reason": "required"
    }
  }
}
```

---

## Shareable Link API

### GET /api/forms/share/:slug

**Purpose**: Get form by shareable slug (public access)

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Customer Feedback",
    "status": "published",
    "slug": "abc123xy",
    "description": "Collect customer feedback",
    "fields": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "type": "text",
        "label": "Your Name",
        "placeholder": "Enter your name",
        "required": true,
        "options": null,
        "order": 1
      }
    ]
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Form not found or link expired"
  }
}
```

---

## AI API

### POST /api/ai/design

**Purpose**: AI assistance for form design

**Request Body**:

```json
{
  "formId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "I need a customer feedback form with a rating field and a comments field",
  "currentFields": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "type": "text",
      "label": "Your Name",
      "required": true,
      "order": 1
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "message": "I've added a rating field using radio buttons and a comments field using textarea. Here's what I've done:",
    "actions": [
      {
        "type": "add_field",
        "field": {
          "type": "radio",
          "label": "How would you rate our product?",
          "placeholder": null,
          "required": true,
          "options": [
            {"label": "Excellent", "value": "excellent"},
            {"label": "Good", "value": "good"},
            {"label": "Fair", "value": "fair"},
            {"label": "Poor", "value": "poor"}
          ],
          "order": 2
        }
      },
      {
        "type": "add_field",
        "field": {
          "type": "textarea",
          "label": "Additional Comments",
          "placeholder": "Tell us more about your experience...",
          "required": false,
          "order": 3
        }
      }
    ]
  }
}
```

**Error Response** (AI unavailable):

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "AI assistance is currently unavailable. Please try again later or design your form manually.",
    "details": {
      "isAIAvailable": false
    }
  }
}
```

---

### POST /api/ai/fill

**Purpose**: AI assistance for form filling

**Request Body**:

```json
{
  "formId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "What does the rating question mean?",
  "currentValues": {
    "660e8400-e29b-41d4-a716-446655440001": "John Doe"
  },
  "fieldId": "660e8400-e29b-41d4-a716-446655440002"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "message": "The rating question asks you to evaluate the overall quality of our product on a scale from Poor to Excellent. Choose the option that best reflects your experience.",
    "suggestion": null
  }
}
```

**Response with suggestion**:

```json
{
  "success": true,
  "data": {
    "message": "For the email field, you can provide your primary email address where we can contact you if needed.",
    "suggestion": {
      "fieldId": "660e8400-e29b-41d4-a716-446655440003",
      "value": "your.email@example.com"
    }
  }
}
```

---

## Summary of Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/forms` | List forms |
| POST | `/api/forms` | Create form |
| GET | `/api/forms/:id` | Get form details |
| PUT | `/api/forms/:id` | Update form |
| DELETE | `/api/forms/:id` | Delete form |
| POST | `/api/forms/:id/publish` | Publish form |
| POST | `/api/forms/:id/fields` | Add field |
| PUT | `/api/forms/:id/fields/:fieldId` | Update field |
| DELETE | `/api/forms/:id/fields/:fieldId` | Delete field |
| GET | `/api/forms/:id/submissions` | List submissions |
| POST | `/api/forms/:id/submissions` | Submit form |
| GET | `/api/forms/share/:slug` | Get form by slug |
| POST | `/api/ai/design` | AI design assistance |
| POST | `/api/ai/fill` | AI fill assistance |

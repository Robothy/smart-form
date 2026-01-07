# API Contracts: Remove AI Features

**Feature**: 002-remove-ai
**Date**: 2026-01-04
**Status**: Endpoints Removed

## Overview

This feature removes AI-related API endpoints from the application. No new endpoints are created.

## Removed Endpoints

The following API endpoints are being removed:

### POST /api/ai/design

**Description**: AI endpoint for assisting with form design

**Status**: REMOVED

**Previous Contract** (for reference):

```http
POST /api/ai/design
Content-Type: application/json

{
  "message": "string",
  "formState": {
    "fields": [...]
  }
}

Response 200:
{
  "success": true,
  "data": {
    "message": "string",
    "actions": [...]  // AI-suggested field additions/changes
  }
}
```

### POST /api/ai/fill

**Description**: AI endpoint for assisting with form filling

**Status**: REMOVED

**Previous Contract** (for reference):

```http
POST /api/ai/fill
Content-Type: application/json

{
  "message": "string",
  "formId": "string",
  "formFields": [...]
}

Response 200:
{
  "success": true,
  "data": {
    "message": "string",
    "suggestions": {...}  // AI-suggested field values
  }
}
```

## Maintained Endpoints

All form-related endpoints remain unchanged:

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| /api/forms | GET | List all forms | MAINTAINED |
| /api/forms | POST | Create new form | MAINTAINED |
| /api/forms/[id] | GET | Get form details | MAINTAINED |
| /api/forms/[id] | PUT | Update form | MAINTAINED |
| /api/forms/[id] | DELETE | Delete form | MAINTAINED |
| /api/forms/[id]/publish | POST | Publish form | MAINTAINED |
| /api/forms/[id]/fields | GET | List form fields | MAINTAINED |
| /api/forms/[id]/fields | POST | Add field to form | MAINTAINED |
| /api/forms/[id]/fields/[fieldId] | PUT | Update form field | MAINTAINED |
| /api/forms/[id]/fields/[fieldId] | DELETE | Delete form field | MAINTAINED |
| /api/forms/[id]/submissions | GET | List form submissions | MAINTAINED |
| /api/forms/[id]/submissions | POST | Submit form | MAINTAINED |
| /api/forms/share/[slug] | GET | Get form by share slug | MAINTAINED |

## Error Handling

No changes to error handling for maintained endpoints. AI-specific errors (e.g., "AI service unavailable") are no longer applicable.

**No new API contracts for this feature.**

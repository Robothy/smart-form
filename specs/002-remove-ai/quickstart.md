# Quickstart: Remove AI Features

**Feature**: 002-remove-ai
**Date**: 2026-01-04
**Status**: Development Guide

## Overview

This guide provides quick reference for developing the simple-form application after AI features have been removed.

## Prerequisites

After AI removal, the application requires:

- Node.js 18+
- No API keys or external AI services required
- libSQL database (included as local file)

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

**No AI-related dependencies** after removal. The package.json contains only:
- next (15.x)
- react (19.x)
- @mui/material (6.x)
- @libsql/client
- drizzle-orm
- zod

### 2. Start Development Server

```bash
npm run dev
```

The application starts without requiring:
- OPENAI_API_KEY or other AI credentials
- CopilotKit configuration
- Mastra agent setup

### 3. Build for Production

```bash
npm run build
```

The build succeeds without AI dependencies.

## Core Functionality

### Form Management

All form features work without AI:

| Feature | How to Access | Notes |
|---------|---------------|-------|
| Create Form | `/forms/new` | Manual field addition only |
| Edit Draft | `/forms/[id]/edit` | No AI assistant available |
| Publish Form | Form detail page | Generates shareable link |
| Fill Form | `/forms/[id]/fill` | No AI assistance available |
| View Submissions | `/forms/[id]/submissions` | Paginated list |

### Form Fields

Supported field types (unchanged):

- text - Single line text input
- textarea - Multi-line text input
- date - Date picker
- radio - Radio button group (single select)
- checkbox - Checkbox group (multi select)

## Code Structure

### Key Directories

```
app/
├── api/
│   └── forms/          # Form API endpoints
├── forms/              # Form UI pages
└── layout.tsx          # Root layout (no CopilotProvider)

components/
├── ui/                 # Reusable UI components
│   ├── FormBuilder.tsx # Manual form builder
│   └── FormFiller.tsx  # Manual form filler
└── layout/             # Layout components

lib/
├── db/                 # Database schema and client
├── utils/              # Utility functions
└── validation/         # Zod schemas
```

### Removed AI Code

The following are no longer present:

- `app/api/ai/` - AI endpoints
- `components/ui/AIAssistant.tsx` - Form design assistant
- `components/ui/FillAssistant.tsx` - Form filling assistant
- `components/layout/CopilotProvider.tsx` - AI context provider
- `lib/ai/` - AI utilities (mastra.ts, prompts.ts, tools.ts)

## Validation

### Client-Side Validation

All forms use Zod schemas for validation:

```typescript
// lib/validation/schemas.ts
export const formFieldSchema = z.object({
  type: z.enum(['text', 'textarea', 'date', 'radio', 'checkbox']),
  label: z.string().min(1).max(200),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional()
});
```

### Server-Side Validation

API routes validate all inputs using the same Zod schemas.

## Database

### Location

```
data/simple-form.db  # Local libSQL database file
```

### Schema

See [data-model.md](./data-model.md) for complete schema.

### Migrations

Run migrations with:

```bash
npx drizzle-kit push
```

## Testing

### Manual Testing Checklist

After AI removal, verify:

- [ ] Form builder loads without AI components
- [ ] Can add/edit/delete fields manually
- [ ] Can save and publish forms
- [ ] Can fill out shared forms
- [ ] Can view form submissions
- [ ] No AI-related console errors
- [ ] Application starts without OPENAI_API_KEY

### Type Checking

```bash
npm run type-check
```

Should pass with no errors (no broken imports to AI components).

## Troubleshooting

### Build Errors

If build fails with import errors:

1. Check for remaining AI imports:
   ```bash
   grep -r "AIAssistant\|FillAssistant\|CopilotProvider" app/
   grep -r "from.*lib/ai" app/
   ```

2. Remove any found imports

3. Re-run type-check

### Missing Components

If UI is missing elements after AI removal:

1. Verify FormBuilder.tsx and FormFiller.tsx are present
2. Check that manual field addition buttons are visible
3. Ensure form state management is working

## Documentation Updates

The following documentation should be updated to remove AI references:

- CLAUDE.md - Remove AI sections from architecture decisions
- README.md (if exists) - Remove AI features from feature list

## Support

For issues related to this feature, see:

- [spec.md](./spec.md) - Feature specification
- [plan.md](./plan.md) - Implementation plan
- [research.md](./research.md) - Research findings
- [data-model.md](./data-model.md) - Data model (unchanged)
- [contracts/api.md](./contracts/api.md) - API contracts

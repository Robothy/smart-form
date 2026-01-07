# Implementation Plan: Form Management Improvements

**Branch**: `[004-form-management-improvements]` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-form-management-improvements/spec.md`

**Updates**: 2026-01-05 - Added clarifications: no authentication, no backward compatibility

## Summary

This feature adds form management improvements to the Simple Form application:
1. **Delete functionality** - Delete forms from list/detail views with cascade deletion of fields and submissions
2. **Submissions grid view** - Table format displaying submission data with columns for each form field
3. **Sticky toolbar** - Fixed action bar in edit form with Publish/Save buttons at top, Add Field at bottom
4. **Navigation enhancement** - Improved nav bar with active state indicators

## Technical Context

**Language/Version**: TypeScript 5.7 (via Next.js 15.1)
**Primary Dependencies**: React 19, MUI v6, @libsql/client, drizzle-orm 0.36, zod 3.24
**Storage**: libSQL embedded SQLite database at `data/simple-form.db`
**Testing**: Jest/Vitest (existing test setup via Next.js)
**Target Platform**: Web application (Next.js 15+ App Router)
**Project Type**: Single web project (Next.js App Router)
**Performance Goals**: FCP < 2s, TTI < 3.5s, delete < 2s, grid load < 3s for 500 submissions
**Constraints**:
- No authentication required - everyone can access any page
- No backward compatibility needed - clean implementation preferred
- Database cascade deletion via foreign keys
- MUI component wrappers required

## Constitution Check

*Initial gate passed. Re-evaluated after Phase 1 design.*

**I. Type Safety**
- [x] TypeScript strict mode enabled in tsconfig.json (Next.js default)
- [x] All dependencies have @types packages or built-in types
- [x] No `@ts-ignore`, `any`, or unsafe `as` casts without documented justification

**II. Form Validation First**
- [x] Client-side validation via zod schemas (existing pattern)
- [x] Server-side validation requirements documented (existing API pattern)
- [x] Error message standards specified (existing pattern)

**III. Component Reusability**
- [x] MUI component wrapper strategy defined (wrap MUI in custom components)
- [x] Component documentation approach planned (existing pattern)

**IV. Progressive Enhancement**
- [x] Client/server component boundaries identified (list/detail pages server, interactive client)
- [x] SSR/SSG strategy documented (list pages SSR, submissions grid SSR with pagination)
- [x] Performance targets defined (FCP < 2s, TTI < 3.5s)

## Project Structure

### Documentation (this feature)

```text
specs/004-form-management-improvements/
├── plan.md              # This file
├── spec.md              # Feature specification with clarifications
├── research.md          # Phase 0 output - technical decisions
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - development guide
├── contracts/           # Phase 1 output
│   └── api.md           # API endpoint specifications
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── forms/               # Form pages (existing)
│   ├── page.tsx         # List view - add delete button
│   ├── [id]/            # Form detail/edit pages
│   │   ├── page.tsx     # Detail view - add delete button
│   │   └── edit/        # Edit page - add sticky toolbar
│   └── [id]/submissions/page.tsx  # Submissions grid view
├── layout.tsx           # Root layout - improve nav bar
└── components/
    ├── ui/              # Existing UI components
    └── forms/           # Form-specific components
        ├── FormList.tsx        # Add delete action
        ├── SubmissionGrid.tsx  # New submissions grid
        ├── EditToolbar.tsx     # New sticky toolbar
        └── NavBar.tsx          # Enhanced nav bar
lib/
├── db/                  # Database (existing)
│   └── schema.ts        # Add cascade delete if needed
└── api/                 # API endpoints
    └── forms.ts         # Add delete endpoint
```

**Structure Decision**: Next.js App Router with client/server component separation. Delete buttons and grid interactions require client components; list views remain server components for performance.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | All constitutional principles satisfied | - |

## Phase 0: Research - COMPLETE

**research.md** contains:
- Database cascade deletion via Drizzle ORM foreign keys
- Confirmation dialog using MUI Dialog
- Submissions grid using MUI DataGrid
- Sticky toolbar using CSS position: sticky
- API endpoint designs (DELETE, GET submissions)

## Phase 1: Design & Contracts - COMPLETE

**data-model.md** contains:
- Form, FormField, FormSubmission entities
- Validation rules (Zod schemas)
- Cascade delete relationships
- Index definitions

**contracts/api.md** contains:
- DELETE /api/forms/[id]
- GET /api/forms/[id]/submissions
- GET /api/forms/[id]/fields
- Response formats and error handling

**quickstart.md** contains:
- Database schema setup
- Key files to modify
- Component code examples
- Testing guidance

## Next Steps

Run `/speckit.tasks` to generate implementation tasks from the plan artifacts.

# Implementation Plan: Publish Button and Share Link Display

**Branch**: `003-publish-share` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-publish-share/spec.md`

## Summary

Add publish button to form edit page and share link display functionality to enable form creators to publish their forms and share them via unique URLs. Published forms are immutable - creators must copy a form to create a new draft version for modifications. Share links are displayed on form detail pages (top of page) and accessible via share icon buttons in the form list (popup/dropdown).

**Technical Approach**: Extend existing forms table schema (slug already exists), add API endpoint for publish action, update UI components for publish button and share link display, implement form copy functionality.

## Technical Context

**Language/Version**: TypeScript 5.7 (via Next.js 15.1)
**Primary Dependencies**: Next.js 15.1, React 19, MUI v6, Drizzle ORM 0.36, Zod 3.24, @libsql/client 0.10
**Storage**: libSQL (embedded SQLite-compatible database) at `data/simple-form.db`
**Testing**: Manual testing (no automated test framework currently configured)
**Target Platform**: Web browser (client-side rendering for interactive components, server-side rendering for pages)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Publish action < 2 seconds, share link display < 1 second, FCP < 2s, TTI < 3.5s
**Constraints**: Published forms are immutable (no edit after publish), share slugs must be unique, forms must have at least one field to publish
**Scale/Scope**: Single-user form builder, forms table with draft/published status, share slug generation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Type Safety**
- [x] TypeScript strict mode enabled in tsconfig.json
- [x] All dependencies have @types packages or built-in types
- [x] No `@ts-ignore`, `any`, or unsafe `as` casts without documented justification

**II. Form Validation First**
- [x] Client-side validation strategy defined (zod schemas)
- [x] Server-side validation requirements documented (API endpoints)
- [x] Error message standards specified (specific actionable messages)

**III. Component Reusability**
- [x] MUI component wrapper strategy defined (wrap Button, IconButton, components for consistency)
- [x] Component documentation approach planned (usage examples in comments)

**IV. Progressive Enhancement**
- [x] Client/server component boundaries identified (server components for pages, client for interactive buttons)
- [x] SSR/SSG strategy documented (Next.js App Router with server components)
- [x] Performance targets defined (FCP < 2s, TTI < 3.5s per constitution)

## Project Structure

### Documentation (this feature)

```text
specs/003-publish-share/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── forms/
│       ├── [id]/
│       │   └── publish/
│       │       └── route.ts           # NEW: POST endpoint to publish form
│       └── [id]/
│           └── copy/
│               └── route.ts           # NEW: POST endpoint to copy form
├── forms/
│   ├── [id]/
│   │   ├── edit/
│   │   │   └── page.tsx               # MODIFY: Add publish button at top
│   │   └── view/
│   │       └── page.tsx               # MODIFY: Add share link section, Copy Form button, read-only styling
│   └── page.tsx                       # MODIFY: Add share icon button for published forms

components/
└── forms/
    ├── PublishButton.tsx              # NEW: MUI-wrapped publish button component
    ├── ShareLinkDisplay.tsx           # NEW: Share link with copy button component
    └── ShareIconButton.tsx            # NEW: Share icon with popup/dropdown component

lib/
├── db/
│   └── schema.ts                      # MODIFY: No schema changes needed (slug exists)
├── utils/
│   └── slug.ts                        # NEW: Slug generation utility with uniqueness handling
└── validation/
    └── forms.ts                       # MODIFY: Add publish validation schema
```

**Structure Decision**: This is a Next.js 15 web application using App Router. The existing structure separates API routes in `app/api/`, page routes in `app/forms/`, and components in `components/forms/`. New components follow MUI wrapper pattern per constitution.

## Complexity Tracking

> No constitution violations - this table not needed

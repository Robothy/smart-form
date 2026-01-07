# Implementation Plan: Remove AI Features

**Branch**: `002-remove-ai` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-remove-ai/spec.md`

## Summary

Remove all AI-related functionality from the form builder application. This includes removing AI assistant UI components (AIAssistant, FillAssistant), AI API endpoints (/api/ai/*), AI library code (lib/ai/*), AI provider (CopilotProvider), and any AI-related configuration or dependencies. The core form functionality (create, edit, publish, fill, view submissions) must remain fully operational.

## Technical Context

**Language/Version**: TypeScript 5.x (via Next.js)
**Primary Dependencies**: Next.js 15+, React 19+, MUI v6+, @libsql/client, drizzle-orm, zod
**Storage**: libSQL (file-based database at `data/simple-form.db`)
**Testing**: Manual testing (no automated test framework currently)
**Target Platform**: Web (Node.js server, browser client)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: < 2s First Contentful Paint, < 3.5s Time to Interactive
**Constraints**: Must maintain existing form functionality after AI removal
**Scale/Scope**: Small-scale application (demonstration/test service)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Type Safety**
- [x] TypeScript strict mode enabled in tsconfig.json (maintained)
- [x] All dependencies have @types packages or built-in types (maintained)
- [x] No `@ts-ignore`, `any`, or unsafe `as` casts without documented justification (maintained)

**II. AI-Native Design**
- [N/A] CopilotKit integration points identified - **Feature removes AI, so this is N/A**
- [N/A] Mastra agent/tool usage documented - **Feature removes AI, so this is N/A**
- [N/A] Form state exposure for AI context defined - **Feature removes AI, so this is N/A**
- [x] Fallback behavior without AI enabled confirmed - **Core form functionality works without AI**

**III. Form Validation First**
- [x] Client-side validation strategy defined (zod - maintained)
- [x] Server-side validation requirements documented (maintained)
- [x] Error message standards specified (maintained)

**IV. Component Reusability**
- [x] MUI component wrapper strategy defined (maintained)
- [x] Component documentation approach planned (maintained)

**V. Progressive Enhancement**
- [x] Client/server component boundaries identified (maintained)
- [x] SSR/SSG strategy documented (maintained)
- [x] Performance targets defined (FCP < 2s, TTI < 3.5s - maintained)

**Gate Status**: PASSED - Feature removes AI features from constitution, but maintains all other principles.

## Project Structure

### Documentation (this feature)

```text
specs/002-remove-ai/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no changes - this is a removal feature)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no new API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── ai/             # TO BE REMOVED (entire directory)
│   │   ├── design/route.ts
│   │   └── fill/route.ts
│   └── forms/          # MAINTAINED (remove AI imports if present)
├── forms/              # MAINTAINED (remove AI components)
│   ├── [id]/edit/page.tsx
│   ├── [id]/fill/page.tsx
│   └── new/page.tsx
└── layout.tsx          # MAINTAINED (remove CopilotProvider)

components/
├── layout/
│   └── CopilotProvider.tsx    # TO BE REMOVED
└── ui/
    ├── AIAssistant.tsx        # TO BE REMOVED
    ├── FillAssistant.tsx      # TO BE REMOVED
    ├── FormBuilder.tsx        # MAINTAINED (remove AI imports)
    ├── FormFiller.tsx         # MAINTAINED (remove AI imports)
    └── [other UI components]  # MAINTAINED

lib/
├── ai/                 # TO BE REMOVED (entire directory)
│   ├── mastra.ts
│   ├── prompts.ts
│   └── tools.ts
├── db/                 # MAINTAINED (no changes)
├── utils/              # MAINTAINED (remove AI-related utilities)
└── validation/         # MAINTAINED (no changes)
```

**Structure Decision**: This is a code removal feature. The structure above identifies what will be removed (AI-related directories and files) and what will be maintained (core form functionality). No new directories or files are created.

## Complexity Tracking

> Not applicable - this feature removes complexity by eliminating AI-related code.

## Phase 0: Research

### Research Tasks

1. **Identify all AI component imports and references**
   - Search for imports of AIAssistant, FillAssistant, CopilotProvider
   - Search for imports from lib/ai/*
   - Identify component usage patterns

2. **Identify AI API endpoint usage**
   - Find all client-side calls to /api/ai/*
   - Identify any server-side references to AI routes

3. **Verify AI independence of core functionality**
   - Confirm forms work without AI (per spec assumption)
   - Identify any hidden dependencies on AI features

4. **Identify environment variables and configuration**
   - Search for OPENAI_API_KEY or similar
   - Check .env files and configuration

### Research Output

See [research.md](./research.md) for detailed findings.

## Phase 1: Design

### Data Model

No changes to the database schema. This is a code removal feature only.

See [data-model.md](./data-model.md) for confirmation of existing entities.

### API Contracts

No new API endpoints. This feature removes existing endpoints.

See [contracts/api.md](./contracts/api.md) for documentation of removed endpoints.

### Quickstart Guide

See [quickstart.md](./quickstart.md) for development setup after AI removal.

## Phase 2: Implementation

See [tasks.md](./tasks.md) for detailed implementation tasks (generated by `/speckit.tasks`).

# Implementation Tasks: Remove AI Features

**Feature Branch**: `002-remove-ai`
**Date**: 2026-01-04
**Status**: Ready for Implementation
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document breaks down the implementation of removing all AI-related functionality from the simple-form application into actionable, developer-executable tasks.

**Total Tasks**: 17
**Estimated Phases**: 5
**Testing**: Manual verification (no automated tests requested)

## Task Legend

- `[P]` = Parallelizable (can run simultaneously with other `[P]` tasks)
- `[US1]` = User Story 1: Remove AI-Assisted Form Design
- `[US2]` = User Story 2: Remove AI-Assisted Form Filling
- `[US3]` = User Story 3: Remove AI Dependencies and Configuration

---

## Phase 1: Setup

**Goal**: Verify current state and prepare for AI removal

**Tasks**:

- [X] T001 Run `npm run type-check` to capture baseline TypeScript status
- [X] T002 Run `npm run build` to capture baseline build status
- [X] T003 Search codebase for all AI-related imports using grep: `grep -r "AIAssistant\|FillAssistant\|CopilotProvider" app/ components/`
- [X] T004 Search codebase for lib/ai imports: `grep -r "from.*lib/ai" app/ components/`

---

## Phase 2: Foundational

**Goal**: Remove core AI infrastructure that all stories depend on

**Blocking**: Must complete before any user story phases

**Tasks**:

- [X] T005 Delete entire `lib/ai/` directory containing mastra.ts, prompts.ts, tools.ts
- [X] T006 Delete entire `app/api/ai/` directory containing design/route.ts and fill/route.ts
- [X] T007 Delete `components/layout/CopilotProvider.tsx`
- [X] T008 Remove CopilotProvider import and wrapper from `app/layout.tsx`
- [X] T009 Verify TypeScript compilation with `npm run type-check` (should fail with broken imports in form pages)

---

## Phase 3: User Story 1 - Remove AI-Assisted Form Design

**Goal**: Remove AI assistant from form builder pages (new and edit)

**User Story**: A user wants the form builder to work without AI-related functionality. No AI chat interface should appear.

**Independent Test**: A user opens `/forms/new` or `/forms/[id]/edit` and sees no AI assistant button, chat interface, or AI-related controls. Manual field addition works normally.

**Acceptance Criteria**:
- No AI-related UI elements visible on form builder pages
- Form builder functions with manual field addition only
- No TypeScript errors related to AI imports

**Tasks**:

- [X] T010 [P] [US1] Delete `components/ui/AIAssistant.tsx` file
- [X] T011 [P] [US1] Remove AIAssistant import and component from `app/forms/new/page.tsx`
- [X] T012 [US1] Remove AIAssistant import and component from `app/forms/[id]/edit/page.tsx`
- [ ] T013 [US1] Run `npm run type-check` and verify no errors related to AIAssistant
- [ ] T014 [US1] Manually test form builder at `/forms/new`: verify no AI UI, manual field addition works
- [ ] T015 [US1] Manually test form builder at `/forms/[id]/edit`: verify no AI UI, manual editing works

---

## Phase 4: User Story 2 - Remove AI-Assisted Form Filling

**Goal**: Remove AI assistant from form filling page

**User Story**: A user filling out a form should not see AI assistance options. No AI chat interface should appear.

**Independent Test**: A user opens a shared form link and sees no AI assistant. Form can be filled and submitted normally.

**Acceptance Criteria**:
- No AI-related UI elements visible on form filling page
- Form submission works without AI processing
- No TypeScript errors related to AI imports

**Tasks**:

- [X] T016 [P] [US2] Delete `components/ui/FillAssistant.tsx` file
- [X] T017 [US2] Remove FillAssistant import and component from `components/ui/FormFiller.tsx`
- [ ] T018 [US2] Run `npm run type-check` and verify no errors related to FillAssistant
- [ ] T019 [US2] Manually test form filling at `/forms/[id]/fill`: verify no AI UI, submission works

---

## Phase 5: User Story 3 - Remove AI Dependencies and Configuration

**Goal**: Remove AI-related configuration and documentation references

**User Story**: Application should not require AI service configuration, API keys, or external AI dependencies.

**Independent Test**: Application starts without OPENAI_API_KEY. No AI references in package.json or documentation.

**Acceptance Criteria**:
- No AI-related dependencies in package.json
- No AI references in documentation
- Application runs without AI configuration
- Code search returns zero AI-related results

**Tasks**:

- [X] T020 [P] [US3] Search package.json for AI-related dependencies: `grep -i "openai\|copilot\|mastra\|ai" package.json`
- [X] T021 [P] [US3] Search environment files for AI configuration: `grep -r "OPENAI_API_KEY\|AI_" . 2>/dev/null || echo "No AI env vars found"`
- [X] T022 [US3] Update `CLAUDE.md` to remove AI-related sections from Architecture Decisions
- [X] T023 [US3] Search entire codebase for remaining AI references: `grep -r "AI\|assistant" --include="*.ts" --include="*.tsx" app/ components/ lib/ | grep -v "ERROR\|WARNING\|info"`
- [X] T024 [US3] Run final `npm run type-check` and verify zero errors (no AI-related errors remain)
- [X] T025 [US3] Run `npm run build` and verify build succeeds
- [X] T026 [US3] Run `npm run dev` and verify application starts without OPENAI_API_KEY
- [X] T027 [US3] Final manual test: create, edit, publish, fill, and view a form to verify all functionality works

---

## Dependencies

```text
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
    ├─→ Phase 3 (US1: Form Design) ──────┐
    │                                   │
    └─→ Phase 4 (US2: Form Filling) ─────┤
                                        │
                                        ↓
                              Phase 5 (US3: Cleanup)
```

**Story Completion Order**:
1. Phase 1: Setup (T001-T004)
2. Phase 2: Foundational (T005-T009) ← **Must complete before stories**
3. Phase 3: US1 - Form Design (T010-T015) ← Can run parallel with US2
4. Phase 4: US2 - Form Filling (T016-T019) ← Can run parallel with US1
5. Phase 5: US3 - Cleanup (T020-T027) ← Must run after US1 and US2

**Note**: US1 and US2 can be executed in parallel after Phase 2 completes because they operate on different files and have no dependencies on each other.

---

## Parallel Execution Opportunities

### After Phase 2 Complete:

**Group 1 - US1 Form Design (T010-T015)**:
```bash
# Terminal 1: Delete AIAssistant component
rm components/ui/AIAssistant.tsx

# Terminal 2: Remove AI imports from new form page (edit app/forms/new/page.tsx)
# Terminal 3: Remove AI imports from edit form page (edit app/forms/[id]/edit/page.tsx)
```

**Group 2 - US2 Form Filling (T016-T019)**:
```bash
# Can run simultaneously with Group 1
# Terminal 1: Delete FillAssistant component
rm components/ui/FillAssistant.tsx

# Terminal 2: Remove Fill imports from fill page (edit app/forms/[id]/fill/page.tsx)
```

### In Phase 5:

**Group 3 - Cleanup Verification (T020-T021)**:
```bash
# Can run in parallel
npm run type-check &  # Terminal 1
grep -r "AI" . --include="*.ts" --include="*.tsx" &  # Terminal 2
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: Complete Phase 1-3 (T001-T015)

This delivers:
- All AI infrastructure removed (lib/ai/, api/ai/, CopilotProvider)
- AI assistant removed from form builder pages
- Core form functionality working with manual field addition

**Verification**: Create, save, and edit a form manually.

### Incremental Delivery

1. **Sprint 1**: Phase 1-2 (Setup + Foundational) - Removes core AI infrastructure
2. **Sprint 2**: Phase 3 (US1) - Removes form design AI
3. **Sprint 3**: Phase 4 (US2) - Removes form filling AI
4. **Sprint 4**: Phase 5 (US3) - Final cleanup and verification

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Broken imports after file deletion | Run type-check after each phase |
| Missing functionality after removal | Manual testing after each user story |
| Documentation inconsistencies | Update CLAUDE.md in final phase |
| Runtime errors from removed code | Start dev server and test all form flows |

---

## Testing Strategy

Since no automated tests were requested, rely on:

1. **TypeScript Compilation**: `npm run type-check` catches broken imports
2. **Build Verification**: `npm run build` ensures production build succeeds
3. **Manual Testing**:
   - Form creation: `/forms/new`
   - Form editing: `/forms/[id]/edit`
   - Form filling: `/forms/[id]/fill`
   - Form submissions: `/forms/[id]/submissions`

---

## File Modification Summary

### Files to Delete:

| File | Reason |
|------|--------|
| `lib/ai/mastra.ts` | AI utility code |
| `lib/ai/prompts.ts` | AI prompt templates |
| `lib/ai/tools.ts` | AI tool functions |
| `app/api/ai/design/route.ts` | AI design endpoint |
| `app/api/ai/fill/route.ts` | AI fill endpoint |
| `components/layout/CopilotProvider.tsx` | AI context provider |
| `components/ui/AIAssistant.tsx` | Form design AI UI |
| `components/ui/FillAssistant.tsx` | Form filling AI UI |

### Files to Modify:

| File | Changes |
|------|---------|
| `app/layout.tsx` | Remove CopilotProvider import and wrapper |
| `app/forms/new/page.tsx` | Remove AIAssistant import and usage |
| `app/forms/[id]/edit/page.tsx` | Remove AIAssistant import and usage |
| `app/forms/[id]/fill/page.tsx` | Remove FillAssistant import and usage |
| `CLAUDE.md` | Remove AI-related documentation sections |

---

## Validation Checklist

After completing all tasks, verify:

- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without OPENAI_API_KEY
- [ ] No AI-related files exist: `ls lib/ai/ app/api/ai/` returns "No such file"
- [ ] Code search for AI returns zero results: `grep -r "AIAssistant\|FillAssistant\|CopilotProvider" app/ components/`
- [ ] Form builder pages work: create, edit, save forms
- [ ] Form filling works: submit via shared link
- [ ] Form submissions view works: view submitted data
- [ ] No AI-related UI elements visible anywhere in app

---

## Notes

- **No database changes**: AI features were stateless, no migrations needed
- **No data loss**: Forms created with AI assistance are stored normally
- **Rollback**: Use git to revert if issues arise
- **Documentation**: CLAUDE.md update is important for future developers

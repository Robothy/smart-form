# Tasks: CSS Centralization and Theme Reuse

**Input**: Design documents from `/specs/005-css-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Visual regression testing and manual component testing per research.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `lib/`, `app/`, `components/` at repository root
- **Theme module**: `lib/theme/` (new directory for this feature)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the theme constants module structure

- [X] T001 Create `lib/theme/` directory structure per implementation plan
- [X] T002 Create `lib/theme/index.ts` with planned export structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before component refactoring can begin

**‚ö†Ô∏è CRITICAL**: No component refactoring work can begin until this phase is complete

- [X] T003 Create `lib/theme/colors.ts` with color value constants referencing CSS variables
- [X] T004 [P] Create `lib/theme/gradients.ts` with gradient definitions for buttons and badges
- [X] T005 [P] Create `lib/theme/spacing.ts` with spacing scale constants
- [X] T006 [P] Create `lib/theme/shadows.ts` with shadow definitions
- [X] T007 Create `lib/theme/components.ts` with component style compositions (buttons, badges, toolbars, cards)
- [X] T008 Update `lib/theme/index.ts` to export all theme constants with JSDoc documentation

**Checkpoint**: Theme module ready - component refactoring can now begin

---

## Phase 3: User Story 1 - Developer Updates Design System (Priority: P1) üéØ MVP

**Goal**: Developer can update a design token in one location and see changes across all components using that token

**Independent Test**: Create a theme constant file with a primary gradient definition. Replace inline gradient definitions in 2-3 components. Verify that changing the constant updates all components.

### Implementation for User Story 1

- [X] T009 [P] [US1] Refactor `components/ui/FormInput.tsx` to use theme constants for date picker styles (~150 lines)
- [X] T010 [P] [US1] Refactor `app/forms/page.tsx` to use theme constants for toolbar and button styles (~50 lines)
- [X] T011 [P] [US1] Refactor `components/forms/FormCard.tsx` to use theme constants for card and button styles (~40 lines)
- [X] T012 [P] [US1] Refactor `components/ui/FormFiller.tsx` to use theme constants for form styling (~35 lines)
- [X] T013 [P] [US1] Refactor `components/forms/EditToolbar.tsx` to use theme constants for toolbar styles
- [X] T014 [US1] Refactor `components/forms/NavBar.tsx` to use theme constants for navbar styles
- [X] T015 [US1] Refactor `components/forms/FormStatusBadge.tsx` to use theme constants for badge styles
- [X] T016 [US1] Refactor `components/forms/ShareIconButton.tsx` to use theme constants for icon button styles
- [X] T017 [US1] Refactor `components/forms/ShareLinkDisplay.tsx` to use theme constants for share link styles
- [X] T018 [US1] Refactor `components/ui/FormBuilder.tsx` to use theme constants for layout styles
- [X] T019 [US1] Refactor `components/ui/FormField.tsx` to use theme constants for field layout styles
- [X] T020 [US1] Refactor `components/forms/SubmissionGrid.tsx` to use theme constants for table styles
- [X] T021 [US1] Refactor `components/ui/SubmissionList.tsx` to use theme constants for list styles
- [X] T022 [US1] Refactor `components/ui/ErrorBoundary.tsx` to use theme constants for error container styles
- [X] T023 [P] [US1] Refactor `app/forms/[id]/view/page.tsx` to use theme constants for toolbar styles
- [X] T024 [P] [US1] Refactor `app/forms/[id]/fill/page.tsx` to use theme constants for container styles
- [X] T025 [P] [US1] Refactor `app/forms/[id]/submissions/page.tsx` to use theme constants for page styles
- [X] T026 [P] [US1] Refactor `app/forms/[id]/edit/page.tsx` to use theme constants for edit page styles
- [X] T027 [P] [US1] Refactor `app/forms/new/page.tsx` to use theme constants for new form page styles
- [X] T028 [US1] Run type-check to verify no TypeScript errors from refactoring
- [ ] T029 [US1] Visual regression testing - verify zero visual changes across all pages

**Checkpoint**: At this point, all components use centralized theme constants - design tokens can be updated in one location

---

## Phase 4: User Story 2 - Developer Creates Consistent New Components (Priority: P2)

**Goal**: Developer can quickly discover and apply theme constants to create consistent new components

**Independent Test**: Create a new component using only theme constants (no hardcoded values). Verify the component matches the existing visual style.

### Implementation for User Story 2

- [ ] T030 [US2] Verify all theme constants have JSDoc documentation with usage examples
- [ ] T031 [P] [US2] Add category comments to `lib/theme/colors.ts` explaining color usage patterns
- [ ] T032 [P] [US2] Add category comments to `lib/theme/components.ts` explaining component style patterns
- [ ] T033 [P] [US2] Add category comments to `lib/theme/gradients.ts` explaining gradient usage patterns
- [ ] T034 [US2] Create example component in `components/examples/ThemedCard.tsx` demonstrating theme constant usage
- [ ] T035 [US2] Update `lib/theme/index.ts` with comprehensive export documentation

**Checkpoint**: At this point, developers have clear documentation and examples for using theme constants

---

## Phase 5: User Story 3 - Team Reduces Style Duplication (Priority: P3)

**Goal**: Measure the reduction in duplicated style definitions across the codebase

**Independent Test**: Audit the codebase before and after refactoring. Count occurrences of duplicated gradient definitions, shadow values, and color codes. Verify reduction in duplication.

### Implementation for User Story 3

- [ ] T036 [US3] Audit codebase for remaining hardcoded color values (e.g., `#6366f1`, `#10b981`) and replace with CSS variable references where appropriate
- [ ] T037 [US3] Audit codebase for remaining duplicated gradient definitions and extract to constants if found
- [ ] T038 [US3] Audit codebase for remaining duplicated shadow definitions and extract to constants if found
- [ ] T039 [US3] Generate duplication report showing before/after counts for gradients, shadows, and colors
- [ ] T040 [US3] Verify at least 80% reduction in duplicated style definitions per SC-003

**Checkpoint**: At this point, code audit confirms significant reduction in style duplication

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T041 [P] Update CLAUDE.md with theme constants usage in Code Style section
- [ ] T042 Run full test suite to ensure no functional regressions
- [ ] T043 [P] Run `npm run lint` and fix any linting issues
- [ ] T044 [P] Run `npm run type-check` and verify no type errors
- [ ] T045 [P] Final visual regression testing across all pages and components
- [ ] T046 Verify quickstart.md examples work correctly
- [ ] T047 Create git commit with all refactoring changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all component refactoring
- **User Story 1 (Phase 3)**: Depends on Foundational completion - highest priority refactoring
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion - documentation enhancement
- **User Story 3 (Phase 5)**: Depends on User Story 1 completion - measurement and cleanup
- **Polish (Phase 6)**: Depends on User Stories 1-3 completion

### User Story Dependencies

- **User Story 1 (P1)**: Core refactoring - MUST complete first. Blocks US2 and US3.
- **User Story 2 (P2)**: Documentation enhancement - depends on US1 theme constants being in place
- **User Story 3 (P3)**: Duplication audit - depends on US1 refactoring being complete

### Within Each User Story

**User Story 1 (Component Refactoring)**:
- Tasks T009-T027 are marked [P] and can run in parallel (different files)
- T028 type-check must complete before T029 visual testing
- T009 (FormInput.tsx) is the most complex - may want to complete first as proof-of-concept

**User Story 2 (Documentation)**:
- Tasks T031-T033 documentation can run in parallel
- T034 example component should be created after documentation

**User Story 3 (Audit)**:
- Tasks T036-T038 audits can run in parallel
- T039 report depends on T036-T038 completing

### Parallel Opportunities

- **Setup (Phase 1)**: Single task - no parallelism
- **Foundational (Phase 2)**: Tasks T004-T006 can run in parallel (different files)
- **User Story 1**: All T009-T027 component refactorings can run in parallel by different team members
- **User Story 2**: Documentation tasks T031-T033 can run in parallel
- **User Story 3**: Audit tasks T036-T038 can run in parallel
- **Polish**: Tasks T043-T045 can run in parallel

---

## Parallel Example: User Story 1 (Component Refactoring)

```bash
# Launch all high-priority component refactorings together:
Task: "Refactor components/ui/FormInput.tsx to use theme constants for date picker styles (~150 lines)"
Task: "Refactor app/forms/page.tsx to use theme constants for toolbar and button styles (~50 lines)"
Task: "Refactor components/forms/FormCard.tsx to use theme constants for card and button styles (~40 lines)"
Task: "Refactor components/ui/FormFiller.tsx to use theme constants for form styling (~35 lines)"

# Launch page-level refactorings together:
Task: "Refactor app/forms/[id]/view/page.tsx to use theme constants for toolbar styles"
Task: "Refactor app/forms/[id]/fill/page.tsx to use theme constants for container styles"
Task: "Refactor app/forms/[id]/submissions/page.tsx to use theme constants for page styles"
Task: "Refactor app/forms/[id]/edit/page.tsx to use theme constants for edit page styles"
Task: "Refactor app/forms/new/page.tsx to use theme constants for new form page styles"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create `lib/theme/` directory)
2. Complete Phase 2: Foundational (create all theme constant files)
3. Complete Phase 3: User Story 1 (refactor all 19 components)
4. **STOP and VALIDATE**: Run type-check and visual regression testing
5. Demo: Show that changing a gradient in `lib/theme/components.ts` updates all buttons

### Incremental Delivery

1. Complete Setup + Foundational ‚Ü?Theme module ready
2. Add User Story 1 (component refactoring) ‚Ü?Test independently ‚Ü?Verify zero visual changes
3. Add User Story 2 (documentation) ‚Ü?Quick reference for developers
4. Add User Story 3 (audit) ‚Ü?Measure 80% duplication reduction
5. Add Polish ‚Ü?Production-ready refactoring

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (1-2 hours)
2. Once Foundational is done:
   - Developer A: Refactor `components/ui/*` components (T009, T010, T012)
   - Developer B: Refactor `components/forms/*` components (T011, T013-T017)
   - Developer C: Refactor `app/forms/**/page.tsx` files (T023-T027)
3. All developers complete User Story 1 tasks in parallel
4. Team regroups for type-check and visual regression testing

---

## Task Summary

| Category | Task Count | Notes |
|----------|------------|-------|
| Phase 1: Setup | 2 tasks | Directory creation |
| Phase 2: Foundational | 6 tasks | Theme module creation (BLOCKS refactoring) |
| Phase 3: User Story 1 | 21 tasks | Component refactoring (MVP core) |
| Phase 4: User Story 2 | 6 tasks | Documentation enhancement |
| Phase 5: User Story 3 | 5 tasks | Audit and measurement |
| Phase 6: Polish | 7 tasks | Validation and cleanup |
| **TOTAL** | **47 tasks** | ~21 parallelizable across phases |

**MVP Scope**: Phases 1-3 (29 tasks) - delivers complete theme module and component refactoring

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- User Story 1 is the core refactoring - US2 and US3 are enhancements
- Visual regression testing is critical for FR-008 (zero visual changes)
- Theme constants MUST maintain exact values from existing inline styles
- JSDoc documentation enables IDE autocomplete for developers
- Commit after each task or logical group of related tasks
- Stop at User Story 1 checkpoint to validate independently before proceeding

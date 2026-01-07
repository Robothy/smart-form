# Implementation Tasks: Form Management Improvements

**Feature**: Form Management Improvements
**Branch**: `004-form-management-improvements`
**Created**: 2026-01-05
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Dependency Graph

```
Phase 1: Setup
    |
    v
Phase 2: Foundational (Database, API endpoints)
    |
    +---> Phase 3: US1 - Delete Forms from List View (P1)
    |
    +---> Phase 4: US2 - Delete Forms from Detail View (P1)
    |          (can run in parallel with US1 - different files)
    |
    +---> Phase 5: US3 - Submissions Grid View (P2)
    |
    +---> Phase 6: US4 - Sticky Toolbar (P2)
    |
    +---> Phase 7: US5 - Navigation Bar (P3)
    |
    v
Phase 8: Polish & Cross-Cutting Concerns
```

## Independent Test Criteria

### User Story 1 (Delete from List)
- Can delete a form from the list page by clicking delete button
- Confirmation dialog appears with form name and submission count
- Canceling keeps the form intact
- Confirming removes the form and all associated data

### User Story 2 (Delete from Detail)
- Can delete a form from the detail page
- After deletion, redirected to forms list
- All fields and submissions are deleted

### User Story 3 (Submissions Grid)
- Submissions display in a table with columns for each field
- Horizontal scrolling for many fields
- Vertical scrolling for many submissions
- Long text truncated with tooltip

### User Story 4 (Sticky Toolbar)
- Toolbar with Publish/Save buttons stays visible while scrolling
- Add Field button is at the bottom of the page
- Responsive to viewport width changes

### User Story 5 (Navigation Bar)
- Current location is clearly visible in navigation
- Navigation items provide quick access to main sections
- Mobile responsive design

## Phase 1: Setup

**Goal**: Verify development environment and existing code structure

- [x] T001 Review existing database schema in `lib/db/schema.ts` to confirm foreign key relationships
- [x] T002 Review existing API patterns in `lib/api/forms.ts`
- [x] T003 Review existing component patterns in `components/forms/`
- [x] T004 Run `npm run type-check` to verify TypeScript setup
- [x] T005 Run `npm run lint` to verify linting setup

## Phase 2: Foundational

**Goal**: Database schema and API endpoints needed by multiple user stories

- [x] T006 Verify cascade delete is configured on formFields foreign key in `lib/db/schema.ts`
- [x] T007 Verify cascade delete is configured on formSubmissions foreign key in `lib/db/schema.ts`
- [x] T008 [P] Implement DELETE /api/forms/[id] endpoint in `app/api/forms/[id]/route.ts` (already exists)
- [x] T009 [P] Implement GET /api/forms/[id]/submissions endpoint in `app/api/forms/[id]/submissions/route.ts` (already exists)
- [x] T010 [P] Implement GET /api/forms/[id]/fields endpoint in `app/api/forms/[id]/fields/route.ts` (added GET)

## Phase 3: User Story 1 - Delete Forms from List View (P1)

**Goal**: Add delete button to forms list page with confirmation dialog

**Independent Test**: Delete a form from list page, verify form no longer appears

- [x] T011 Create DeleteConfirmationDialog component in `components/forms/DeleteConfirmationDialog.tsx`
- [x] T012 Add delete button with icon to FormCard component in `components/forms/FormCard.tsx`
- [x] T013 Integrate DeleteConfirmationDialog in FormCard with open/close state management
- [x] T014 Call DELETE /api/forms/[id] when confirmation is confirmed
- [x] T015 Refresh form list after successful deletion
- [x] T016 Handle API errors with user-friendly error display

## Phase 4: User Story 2 - Delete Forms from Detail View (P1)

**Goal**: Add delete button to form detail page with redirect after deletion

**Independent Test**: Delete a form from detail page, verify redirect to list

- [x] T017 Add delete button to form detail page in `app/forms/[id]/view/page.tsx`
- [x] T018 Reuse DeleteConfirmationDialog component from US1
- [x] T019 Call DELETE /api/forms/[id] when confirmation is confirmed
- [x] T020 Redirect to `/forms` after successful deletion using Next.js `redirect()`
- [x] T021 Handle API errors with user-friendly error display

## Phase 5: User Story 3 - View Submissions in Grid Format (P2)

**Goal**: Display submissions in a table/grid format with columns for each field

**Independent Test**: View submissions page, see data in grid with proper columns

- [x] T022 Create SubmissionGrid component in `components/forms/SubmissionGrid.tsx` using MUI Table
- [x] T023 Create submissions page in `app/forms/[id]/submissions/page.tsx`
- [x] T024 Fetch form fields via GET /api/forms/[id]/fields for column headers
- [x] T025 Fetch submissions via GET /api/forms/[id]/submissions for grid rows
- [x] T026 Map field labels to DataGrid columns (MUI Table columns)
- [x] T027 Implement tooltip for truncated long text in grid cells
- [x] T028 Handle empty state (no submissions) with appropriate message
- [x] T029 Handle loading state with CircularProgress

## Phase 6: User Story 4 - Sticky Toolbar in Edit Form (P2)

**Goal**: Add sticky toolbar at top and Add Field button at bottom

**Independent Test**: Scroll down edit page, toolbar stays visible, Add Field at bottom

- [x] T030 Create EditToolbar component in `components/forms/EditToolbar.tsx` with sticky positioning
- [x] T031 Add Publish button with onClick handler to EditToolbar
- [x] T032 Add Save Changes button with onClick handler to EditToolbar
- [x] T033 Integrate EditToolbar at top of edit page in `app/forms/[id]/edit/page.tsx`
- [x] T034 Move Add Field button to bottom of edit page with fixed positioning (AddFieldButton)
- [x] T035 Ensure toolbar z-index prevents overlap with form fields

## Phase 7: User Story 5 - Improved Navigation Bar (P3)

**Goal**: Improve navigation bar with active state indicators

**Independent Test**: Navigate through app, see current location highlighted

- [x] T036 Create enhanced NavBar component in `components/forms/NavBar.tsx`
- [x] T037 Add usePathname hook for active state detection
- [x] T038 Add visual indicators for current location (active styling)
- [x] T039 Add hover effects on navigation items
- [x] T040 Integrate NavBar in `app/layout.tsx`
- [x] T041 Ensure responsive design for mobile viewports

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final polish, error handling, and verification

- [x] T042 Verify all API responses follow `{ success, data, error }` format (existing pattern)
- [x] T043 Add loading states (CircularProgress) to all async operations
- [x] T044 Add error handling with user-friendly messages and Alert components
- [ ] T045 Run `npm run type-check` and fix any type errors (pre-existing errors exist)
- [ ] T046 Run `npm run lint` and fix any linting issues (pre-existing errors exist)
- [x] T047 Test delete cascade (form, fields, submissions all deleted)
- [x] T048 Test submissions grid with various data sizes
- [x] T049 Test sticky toolbar scroll behavior
- [x] T050 Test navigation active states across all pages

## Parallel Execution Examples

### Parallel Group A (US1 + US2)
- T011 Create DeleteConfirmationDialog (US1)
- T012 Add delete button to FormList (US1)
- T017 Add delete button to detail page (US2)
- T018 Reuse dialog in detail page (US2)

These can run in parallel because:
- Different files (FormList.tsx vs [id]/page.tsx)
- No dependencies between them
- Both use the same DeleteConfirmationDialog component

### Parallel Group B (US3 + US4)
- T022 Create SubmissionGrid component (US3)
- T030 Create EditToolbar component (US4)

These can run in parallel because:
- Different components
- No shared dependencies
- Independent user experiences

### Parallel Group C (All API endpoints)
- T008 DELETE /api/forms/[id] (US1, US2)
- T009 GET /api/forms/[id]/submissions (US3)
- T010 GET /api/forms/[id]/fields (US3)

These can run in parallel because:
- Different endpoints
- No shared code dependencies
- Can be implemented independently

## Implementation Strategy

### MVP Scope (User Story 1 Only)
The minimum viable product is User Story 1:
- T006-T007: Verify database cascade delete
- T008: DELETE /api/forms/[id] endpoint
- T011-T016: Delete from list view with confirmation

This delivers core delete functionality that users can test independently.

### Incremental Delivery

1. **Sprint 1**: Delete from List View (US1) - Core CRUD functionality
2. **Sprint 2**: Delete from Detail View (US2) - Complete delete UX
3. **Sprint 3**: Submissions Grid (US3) - Data viewing capability
4. **Sprint 4**: Sticky Toolbar (US4) - Edit page UX improvement
5. **Sprint 5**: Navigation Bar (US5) - Overall UX improvement
6. **Sprint 6**: Polish - Error handling, loading states, testing

## Task Summary

| Phase | User Story | Tasks | Parallelizable |
|-------|------------|-------|----------------|
| 1 | Setup | 5 | 5 |
| 2 | Foundational | 5 | 5 |
| 3 | US1 - Delete List | 6 | 2 |
| 4 | US2 - Delete Detail | 5 | 3 |
| 5 | US3 - Grid View | 8 | 4 |
| 6 | US4 - Sticky Toolbar | 6 | 3 |
| 7 | US5 - Nav Bar | 6 | 4 |
| 8 | Polish | 9 | 9 |

**Total Tasks**: 50
**Parallelizable Tasks**: 35 (70%)

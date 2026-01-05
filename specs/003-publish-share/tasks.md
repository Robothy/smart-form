---

description: "Task list for publish button and share link display feature implementation"
---

# Tasks: Publish Button and Share Link Display

**Input**: Design documents from `/specs/003-publish-share/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing only - no automated tests specified for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web application**: `app/` for Next.js App Router, `components/` for UI components, `lib/` for utilities

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create utility functions and validation schemas needed by all user stories.

- [X] T001 [P] Create slug generation utility in lib/utils/slug.ts
- [X] T002 [P] Create clipboard copy utility in lib/utils/clipboard.ts
- [X] T003 [P] Create publish validation schema in lib/validation/forms.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites - existing database schema supports all features.

**Note**: The existing `forms.slug` column and `forms.status` enum already support publish functionality. No database migrations needed.

**Checkpoint**: Ready to implement user stories in parallel or sequentially

---

## Phase 3: User Story 1 - Publish Form from Edit Page (Priority: P1) 🎯 MVP

**Goal**: Enable form creators to publish a draft form from the edit page with a single click, generating a shareable slug and redirecting to the read-only detail view.

**Independent Test**: Create a draft form with at least one field, click the Publish button at the top of the edit page, verify status changes to "published" and user is redirected to read-only detail view with share link.

### Implementation for User Story 1

- [X] T004 [P] [US1] Create PublishButton client component in components/forms/PublishButton.tsx
- [X] T005 [P] [US1] Create POST endpoint for publishing form in app/api/forms/[id]/publish/route.ts
- [X] T006 [US1] Integrate PublishButton component in app/forms/[id]/edit/page.tsx (add to top of page)
- [X] T007 [US1] Add redirect logic to published form detail view after successful publish
- [X] T008 [US1] Add form status check to prevent editing published forms in app/forms/[id]/edit/page.tsx

**Checkpoint**: At this point, users can publish draft forms and are redirected to read-only detail view. US1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - View Share Link on Published Form Detail Page (Priority: P2)

**Goal**: Display the shareable link at the top of published form detail pages with a copy button for easy sharing.

**Independent Test**: Publish a form, navigate to the form detail view, verify share link section is visible at top of page with a working Copy button that shows confirmation message.

### Implementation for User Story 2

- [X] T009 [P] [US2] Create ShareLinkDisplay client component in components/forms/ShareLinkDisplay.tsx
- [X] T010 [US2] Add "Published" badge styling to components/forms/ShareLinkDisplay.tsx
- [X] T011 [US2] Add read-only field styling for published forms in components/forms/ShareLinkDisplay.tsx
- [X] T012 [P] [US2] Create POST endpoint for copying form in app/api/forms/[id]/copy/route.ts
- [X] T013 [P] [US2] Create CopyFormButton client component in components/forms/CopyFormButton.tsx
- [X] T014 [US2] Integrate ShareLinkDisplay and CopyFormButton in app/forms/[id]/view/page.tsx (add to top of page)
- [X] T015 [US2] Add conditional rendering for draft forms (hide share link section)

**Checkpoint**: At this point, users can see share links on published form detail pages, copy links to clipboard, and copy forms to create new draft versions. US1 and US2 are both functional.

---

## Phase 5: User Story 3 - View Share Link in Form List (Priority: P3)

**Goal**: Display share icon buttons for published forms in the form list, showing the share link in a popup/dropdown when clicked.

**Independent Test**: Publish multiple forms, view the form list, verify published forms show share icon buttons, click icon to verify popup shows full share link with copy option.

### Implementation for User Story 3

- [X] T016 [P] [US3] Create ShareIconButton client component in components/forms/ShareIconButton.tsx
- [X] T017 [US3] Add popup/dropdown menu to ShareIconButton component in components/forms/ShareIconButton.tsx
- [X] T018 [US3] Integrate ShareIconButton in app/forms/page.tsx (add to form list items for published forms only)
- [X] T019 [US3] Add conditional rendering to hide share icon for draft forms

**Checkpoint**: All user stories are now complete and independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that enhance the overall feature experience.

- [X] T020 [P] Add loading states to PublishButton component during API calls
- [X] T021 [P] Add error handling with user-friendly messages for publish failures
- [X] T022 [P] Add loading states to CopyFormButton component during API calls
- [X] T023 [P] Add success notification/toast after copying share link to clipboard
- [X] T024 [P] Add success notification/toast after copying a form
- [X] T025 [P] Ensure responsive layout for share link display on mobile devices
- [X] T026 [P] Add keyboard navigation support (Enter key) for publish and copy actions
- [X] T027 [P] Add ARIA labels to all buttons for accessibility
- [ ] T028 Run manual testing per quickstart.md checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No blocking work - existing schema is sufficient
- **User Stories (Phase 3-5)**: Can proceed in parallel after Setup phase
  - US1 (Publish Form): Can start after Setup - No dependencies on other stories
  - US2 (Share Link Detail): Can start after Setup - No dependencies on US1
  - US3 (Share Link List): Can start after Setup - No dependencies on US1 or US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup phase - Completely independent
- **User Story 2 (P2)**: Can start after Setup phase - Completely independent
- **User Story 3 (P3)**: Can start after Setup phase - Completely independent

### Within Each User Story

- Utility components can be built in parallel (marked with [P])
- API endpoints before client components that consume them
- Component integration after component creation
- Polish after all user stories complete

### Parallel Opportunities

- All Setup phase tasks (T001-T003) can run in parallel
- Within US1: T004 and T005 can run in parallel
- Within US2: T009, T010, T011, T012 can run in parallel
- Within US3: T016 and T017 can run in parallel
- User stories can be developed in parallel by different team members
- All Polish phase tasks (T020-T028) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch component and API endpoint creation together:
Task: "Create PublishButton client component in components/forms/PublishButton.tsx"
Task: "Create POST endpoint for publishing form in app/api/forms/[id]/publish/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (utility functions)
2. Skip Phase 2: No foundational work needed
3. Complete Phase 3: User Story 1 (Publish Form)
4. **STOP and VALIDATE**: Test publishing a form independently
5. Demo/deploy if ready

**MVP delivers**: Users can publish forms and see the read-only detail view with share link.

### Incremental Delivery

1. Complete Setup → Utilities ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish → Final deployment

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup together
2. Once Setup is done:
   - Developer A: User Story 1 (T004-T008)
   - Developer B: User Story 2 (T009-T015)
   - Developer C: User Story 3 (T016-T019)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests specified - manual testing per quickstart.md
- Existing database schema supports all features without migrations
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies

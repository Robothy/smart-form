# Tasks: AI-Powered Form Builder

**Input**: Design documents from `/specs/001-ai-form-builder/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature. The specification does not explicitly require TDD. Test tasks are included as optional items that can be skipped.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` for pages, `components/` for React components, `lib/` for utilities
- **Database**: `lib/db/` for schema and client
- **API Routes**: `app/api/` for backend endpoints
- **AI Integration**: `lib/ai/` for Mastra agent configuration

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 15+ project with TypeScript and App Router
- [X] T002 Install core dependencies: React 19+, MUI v6+, @libsql/client, drizzle-orm, zod
- [X] T003 [P] Install AI dependencies: @copilotkit/react-core, @copilotkit/react-ui, @mastra/core
- [X] T004 [P] Configure TypeScript strict mode in tsconfig.json
- [X] T005 [P] Create directory structure: app/, components/, lib/, data/, drizzle/
- [X] T006 [P] Create .env.local with DATABASE_URL and OPENAI_API_KEY placeholders
- [X] T007 [P] Add data/ directory to .gitignore for database file
- [X] T008 [P] Configure ESLint and Prettier for TypeScript and React
- [X] T009 [P] Create drizzle.config.ts with libSQL configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Create database schema with forms, formFields, formSubmissions tables in lib/db/schema.ts
- [X] T011 Create libSQL client singleton in lib/db/client.ts
- [X] T012 [P] Create Drizzle migrations directory structure in drizzle/migrations/
- [X] T013 [P] Generate and apply initial database migration with drizzle-kit
- [X] T014 [P] Create Zod validation schemas for all field types in lib/validation/schemas.ts
- [X] T015 [P] Create slug generation utility in lib/utils/generate-slug.ts
- [X] T016 [P] Create pagination helpers in lib/utils/pagination.ts
- [X] T017 [P] Create MUI wrapper components in components/ui/ (FormField, FormInput, Button)
- [X] T018 [P] Create root layout with CopilotKit provider in app/layout.tsx
- [X] T019 [P] Create base API response utility functions in lib/utils/api-response.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Edit Forms (Priority: P1) 🎯 MVP

**Goal**: Enable users to create forms with multiple field types, save as drafts, and edit saved forms

**Independent Test**: Create a form with 3 different field types, save it, close browser, reopen, add a 4th field, and save again. Verify all fields persist correctly.

### Optional Tests for User Story 1 ⚠️

> **NOTE: These tests are OPTIONAL. Skip if not doing TDD.**

- [ ] T020 [P] [US1] (Optional) Contract test for POST /api/forms in tests/contract/test-forms-api.ts
- [ ] T021 [P] [US1] (Optional) Contract test for POST /api/forms/:id/fields in tests/contract/test-forms-api.ts
- [ ] T022 [P] [US1] (Optional) Integration test for create and edit form workflow in tests/integration/test-form-workflow.ts

### Implementation for User Story 1

- [X] T023 [P] [US1] Create POST /api/forms route for creating new forms in app/api/forms/route.ts
- [X] T024 [P] [US1] Create GET /api/forms route for listing all forms in app/api/forms/route.ts
- [X] T025 [P] [US1] Create GET /api/forms/:id route for getting form details in app/api/forms/[id]/route.ts
- [X] T026 [P] [US1] Create PUT /api/forms/:id route for updating form metadata in app/api/forms/[id]/route.ts
- [X] T027 [P] [US1] Create DELETE /api/forms/:id route in app/api/forms/[id]/route.ts (draft only)
- [X] T028 [P] [US1] Create POST /api/forms/:id/fields route for adding fields in app/api/forms/[id]/fields/route.ts
- [X] T029 [P] [US1] Create PUT /api/forms/:id/fields/:fieldId route in app/api/forms/[id]/fields/[fieldId]/route.ts
- [X] T030 [P] [US1] Create DELETE /api/forms/:id/fields/:fieldId route in app/api/forms/[id]/fields/[fieldId]/route.ts
- [X] T031 [US1] Create FormBuilder component in components/ui/FormBuilder.tsx for form creation/editing UI
- [X] T032 [US1] Create FormFieldEditor component in components/ui/FormFieldEditor.tsx for editing individual fields
- [X] T033 [US1] Create form creation page in app/forms/new/page.tsx
- [X] T034 [US1] Create form edit page in app/forms/[id]/edit/page.tsx
- [X] T035 [US1] Create FormCard component in components/forms/FormCard.tsx for form list display
- [X] T036 [US1] Create FormStatusBadge component in components/forms/FormStatusBadge.tsx
- [X] T037 [US1] Add validation to prevent editing published forms in API routes

**Checkpoint**: At this point, users can create, save, and edit forms. User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 4 - Fill Out Forms (Priority: P1) 🎯 MVP

**Goal**: Enable anonymous users to access shared forms, fill fields, and submit with validation

**Independent Test**: Open a shared form link, fill all required fields, submit, verify success message. Try submitting without required fields and verify validation errors.

### Optional Tests for User Story 4 ⚠️

> **NOTE: These tests are OPTIONAL. Skip if not doing TDD.**

- [ ] T038 [P] [US4] (Optional) Contract test for GET /api/forms/share/:slug in tests/contract/test-share-api.ts
- [ ] T039 [P] [US4] (Optional) Contract test for POST /api/forms/:id/submissions in tests/contract/test-submissions-api.ts
- [ ] T040 [P] [US4] (Optional) Integration test for form submission workflow in tests/integration/test-form-submission.ts

### Implementation for User Story 4

- [X] T041 [P] [US4] Create GET /api/forms/share/:slug route for public form access in app/api/forms/share/[slug]/route.ts
- [X] T042 [P] [US4] Create POST /api/forms/:id/submissions route in app/api/forms/[id]/submissions/route.ts
- [X] T043 [P] [US4] Add submission validation logic to check required fields and field type constraints
- [X] T044 [US4] Create FormFiller component in components/ui/FormFiller.tsx for public form filling UI
- [X] T045 [US4] Create form fill page in app/forms/[id]/fill/page.tsx
- [X] T046 [US4] Create shareable link page in app/forms/share/[slug]/page.tsx (redirects to fill page)
- [X] T047 [US4] Add field-specific validation: text (max 1000), textarea (max 10000), date (ISO format), radio/checkbox (options match)
- [X] T048 [US4] Add validation error display below each form field
- [X] T049 [US4] Add success confirmation after form submission

**Checkpoint**: At this point, users can share forms and collect submissions. User Stories 1 AND 4 should both work independently.

---

## Phase 5: User Story 2 - Publish and Share Forms (Priority: P2)

**Goal**: Enable users to publish forms generating unique shareable links; published forms become read-only

**Independent Test**: Create a form, publish it, verify unique link is generated. Try to edit the published form and verify it's read-only. Access the shareable link and verify form loads correctly.

### Optional Tests for User Story 2 ⚠️

> **NOTE: These tests are OPTIONAL. Skip if not doing TDD.**

- [ ] T050 [P] [US2] (Optional) Contract test for POST /api/forms/:id/publish in tests/contract/test-publish-api.ts
- [ ] T051 [P] [US2] (Optional) Integration test for publish workflow in tests/integration/test-publish-workflow.ts

### Implementation for User Story 2

- [X] T052 [P] [US2] Create POST /api/forms/:id/publish route in app/api/forms/[id]/publish/route.ts
- [X] T053 [US2] Implement slug generation with collision detection in publish route
- [X] T054 [US2] Add validation: prevent publishing forms with no fields
- [X] T055 [US2] Add validation: prevent publishing already published forms
- [X] T056 [US2] Update GET /api/forms/:id to include shareable link when published
- [X] T057 [US2] Disable edit controls on FormBuilder when form status is published
- [X] T058 [US2] Add publish button and shareable link display in form detail page
- [X] T059 [US2] Update FormCard to show shareable link for published forms

**Checkpoint**: At this point, users can publish forms and generate shareable links. User Stories 1, 2, AND 4 should all work independently.

---

## Phase 6: User Story 3 - View Form Submissions (Priority: P2)

**Goal**: Enable users to view all submissions for a published form with pagination (20 per page)

**Independent Test**: Publish a form, submit 25 entries via shareable link, open form detail page and verify count of 25. Navigate between pages and verify pagination works.

### Optional Tests for User Story 3 ⚠️

> **NOTE: These tests are OPTIONAL. Skip if not doing TDD.**

- [ ] T060 [P] [US3] (Optional) Contract test for GET /api/forms/:id/submissions with pagination in tests/contract/test-submissions-api.ts
- [ ] T061 [P] [US3] (Optional) Integration test for pagination workflow in tests/integration/test-pagination.ts

### Implementation for User Story 3

- [X] T062 [P] [US3] Update GET /api/forms/:id/submissions route with pagination logic (page, limit params)
- [X] T063 [P] [US3] Add submission count to form detail response
- [X] T064 [US3] Create SubmissionList component in components/ui/SubmissionList.tsx
- [X] T065 [US3] Add pagination controls to SubmissionList component
- [X] T066 [US3] Create form detail page in app/forms/[id]/view/page.tsx
- [X] T067 [US3] Display submissions as view-only (read-only mode)
- [X] T068 [US3] Add empty state message when form has no submissions
- [X] T069 [US3] Optimize query with database indexes if performance issues arise

**Checkpoint**: At this point, users can view all form submissions with pagination. User Stories 1, 2, 3, AND 4 should all work independently.

---

## Phase 7: User Story 7 - Form List Management (Priority: P2)

**Goal**: Provide a central hub to view all forms with status indicators and navigate to appropriate actions

**Independent Test**: Create 3 draft forms and publish 2 forms. Open form list page and verify all 5 forms display with correct status badges. Click a draft form → opens editor. Click a published form → opens detail page.

### Optional Tests for User Story 7 ⚠️

> **NOTE: These tests are OPTIONAL. Skip if not doing TDD.**

- [ ] T070 [P] [US7] (Optional) Integration test for form list navigation in tests/integration/test-form-list.ts

### Implementation for User Story 7

- [X] T071 [P] [US7] Update GET /api/forms route to support status filtering query parameter
- [X] T072 [US7] Create form list page in app/forms/page.tsx
- [X] T073 [US7] Add status filter controls (All/Draft/Published) to form list page
- [X] T074 [US7] Display FormCard components in grid/list layout on form list page
- [X] T075 [US7] Add navigation: draft forms → edit page, published forms → detail page
- [X] T076 [US7] Add "Create New Form" button on form list page
- [X] T077 [US7] Handle empty state when no forms exist

**Checkpoint**: At this point, users have a complete form management interface. All P1 and P2 user stories should work independently.

---

## Phase 8: User Story 5 - AI-Assisted Form Design (Priority: P3)

**Goal**: Enable AI assistant to help users design forms by adding fields and suggesting structures via chat

**Independent Test**: Open form creation page, open AI chat, say "I need a customer feedback form with rating and comments", verify AI suggests appropriate fields or adds them to the form.

### Optional Tests for User Story 5 ⚠️

> **NOTE: These tests are OPTIONAL. Skip if not doing TDD.**

- [ ] T078 [P] [US5] (Optional) Contract test for POST /api/ai/design in tests/contract/test-ai-design-api.ts
- [ ] T079 [P] [US5] (Optional) Integration test for AI design assistance in tests/integration/test-ai-design.ts

### Implementation for User Story 5

- [X] T080 [P] [US5] Create Mastra agent configuration in lib/ai/mastra.ts
- [X] T081 [P] [US5] Create AI tools for form operations (addField, removeField, modifyField) in lib/ai/tools.ts
- [X] T082 [P] [US5] Create AI system prompts for form design assistance in lib/ai/prompts.ts
- [X] T083 [P] [US5] Create POST /api/ai/design route in app/api/ai/design/route.ts
- [X] T084 [US5] Add useCopilotAction hook in FormBuilder to expose form state to AI
- [X] T085 [US5] Integrate AI actions with form builder (addField, modifyField based on AI responses)
- [X] T086 [US5] Add AIPopup component (CopilotKit PopupChat) to form creation/edit pages
- [X] T087 [US5] Handle AI unavailability gracefully (show message, don't crash)
- [X] T088 [US5] Add user confirmation before AI makes changes to form

**Checkpoint**: At this point, AI can assist with form design. Form creation works with or without AI.

---

## Phase 9: User Story 6 - AI-Assisted Form Filling (Priority: P3)

**Goal**: Enable AI assistant to help form fillers understand questions and suggest answers without auto-submitting

**Independent Test**: Open a shared form, open AI chat, ask "What does this question mean?", verify AI provides explanation without modifying form values. Ask for suggestion and verify user must manually accept.

### Optional Tests for User Story 6 ⚠️

> **NOTE: These tests are OPTIONAL. Skip if not doing TDD.**

- [ ] T089 [P] [US6] (Optional) Contract test for POST /api/ai/fill in tests/contract/test-ai-fill-api.ts
- [ ] T090 [P] [US6] (Optional) Integration test for AI fill assistance in tests/integration/test-ai-fill.ts

### Implementation for User Story 6

- [X] T091 [P] [US6] Create Mastra agent context for form filling in lib/ai/mastra.ts
- [X] T092 [P] [US6] Create AI tools for form filling (explainQuestion, suggestAnswer) in lib/ai/tools.ts
- [X] T093 [P] [US6] Create AI system prompts for form filling assistance in lib/ai/prompts.ts
- [X] T094 [P] [US6] Create POST /api/ai/fill route in app/api/ai/fill/route.ts
- [X] T095 [US6] Add useCopilotReadable hook in FormFiller to expose form questions to AI
- [X] T096 [US6] Add AIPopup component to form fill page (app/forms/[id]/fill/page.tsx)
- [X] T097 [US6] Implement suggestion display and manual acceptance UI
- [X] T098 [US6] Ensure AI conversation does not interfere with form submission
- [X] T099 [US6] Handle AI unavailability gracefully (chat unavailable message)

**Checkpoint**: At this point, AI can assist with form filling. All user stories complete.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T100 [P] Update CLAUDE.md with any new technical decisions made during implementation
- [X] T101 [P] Add keyboard navigation support to form fields
- [X] T102 [P] Add loading states to all API calls
- [ ] T103 Optimize database queries based on actual usage patterns
- [X] T104 Add error boundary components for graceful error handling
- [X] T105 [P] Review and optimize bundle size (lazy load AI components)
- [X] T106 [P] Add accessibility attributes (ARIA labels) to all form components
- [ ] T107 Run quickstart.md validation and fix any issues
- [ ] T108 Performance audit: FCP < 2s, TTI < 3.5s targets
- [X] T109 Security review: sanitize all inputs, validate on server-side

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (uses US1 forms but can test with seeded data)
- **User Story 2 (P2)**: Depends on User Story 1 (needs forms to publish) but can be tested independently
- **User Story 3 (P2)**: Depends on User Story 2 (needs published forms) and User Story 4 (needs submissions)
- **User Story 7 (P2)**: Depends on User Story 1 (forms to list) and User Story 2 (status badges)
- **User Story 5 (P3)**: Depends on User Story 1 (needs form builder to integrate with)
- **User Story 6 (P3)**: Depends on User Story 4 (needs form filler to integrate with)

### Recommended Sequential Flow

```
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
    ├─→ User Story 1 (Phase 3) 🎯 MVP Complete here
    │       ↓
    ├─→ User Story 4 (Phase 4) 🎯 MVP Complete here
    │       ↓
    ├─→ User Story 2 (Phase 5)
    │       ↓
    ├─→ User Story 3 (Phase 6)
    │       ↓
    ├─→ User Story 7 (Phase 7)
    │       ↓
    ├─→ User Story 5 (Phase 8)
    │       ↓
    └─→ User Story 6 (Phase 9)
            ↓
        Polish (Phase 10)
```

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- API routes before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- User Stories 1 and 4 can be developed in parallel after Foundational phase (by different developers)
- All API routes within a story marked [P] can run in parallel
- All optional tests for a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all API routes for User Story 1 together:
Task: "Create POST /api/forms route in app/api/forms/route.ts"
Task: "Create GET /api/forms route in app/api/forms/route.ts"
Task: "Create GET /api/forms/:id route in app/api/forms/[id]/route.ts"
Task: "Create PUT /api/forms/:id route in app/api/forms/[id]/route.ts"
Task: "Create DELETE /api/forms/:id route in app/api/forms/[id]/route.ts"
Task: "Create POST /api/forms/:id/fields route in app/api/forms/[id]/fields/route.ts"
Task: "Create PUT /api/forms/:id/fields/:fieldId route in app/api/forms/[id]/fields/[fieldId]/route.ts"
Task: "Create DELETE /api/forms/:id/fields/:fieldId route in app/api/forms/[id]/fields/[fieldId]/route.ts"

# Launch UI components in parallel:
Task: "Create FormBuilder component in components/ui/FormBuilder.tsx"
Task: "Create FormFieldEditor component in components/ui/FormFieldEditor.tsx"
Task: "Create FormCard component in components/forms/FormCard.tsx"
Task: "Create FormStatusBadge component in components/forms/FormStatusBadge.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create and Edit Forms)
4. Complete Phase 4: User Story 4 (Fill Out Forms)
5. **STOP and VALIDATE**: Test User Stories 1 and 4 independently
6. Deploy/demo MVP - users can create forms and collect submissions

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Form creation works
3. Add User Story 4 → Test independently → Form filling works → Deploy/Demo (MVP!)
4. Add User Story 2 → Test independently → Publishing works
5. Add User Story 3 → Test independently → Submission viewing works
6. Add User Story 7 → Test independently → Form management complete
7. Add User Story 5 → Test independently → AI design assistance works
8. Add User Story 6 → Test independently → AI fill assistance works
9. Polish → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Form creation)
   - Developer B: User Story 4 (Form filling)
3. After P1 stories complete:
   - Developer A: User Story 2 (Publishing) + User Story 7 (Form list)
   - Developer B: User Story 3 (Submission viewing)
4. After P2 stories complete:
   - Developer A: User Story 5 (AI design)
   - Developer B: User Story 6 (AI filling)
5. Team: Polish phase together

---

## Task Summary

- **Total Tasks**: 109
- **Setup Phase**: 9 tasks
- **Foundational Phase**: 10 tasks
- **User Story 1**: 18 tasks (3 optional tests + 15 implementation)
- **User Story 4**: 12 tasks (3 optional tests + 9 implementation)
- **User Story 2**: 10 tasks (2 optional tests + 8 implementation)
- **User Story 3**: 10 tasks (2 optional tests + 8 implementation)
- **User Story 7**: 8 tasks (1 optional test + 7 implementation)
- **User Story 5**: 11 tasks (2 optional tests + 9 implementation)
- **User Story 6**: 11 tasks (2 optional tests + 9 implementation)
- **Polish Phase**: 10 tasks
- **Optional Tests**: 15 tasks (can be skipped if not doing TDD)
- **Core Implementation**: 94 tasks (excluding optional tests)

### Parallel Opportunities

- **Setup**: 7 parallel tasks
- **Foundational**: 7 parallel tasks
- **User Story 1**: 8 parallel API routes, 4 parallel UI components
- **User Story 4**: 2 parallel API routes
- **User Story 2**: 1 API route
- **User Story 3**: 2 parallel components (API + UI)
- **User Story 7**: 1 API route + parallel UI tasks
- **User Story 5**: 4 parallel setup tasks
- **User Story 6**: 4 parallel setup tasks
- **Polish**: 4 parallel tasks

### MVP Scope Recommendation

**MVP = User Stories 1 + 4** (30 core implementation tasks + 6 optional tests)
- Users can create forms with all field types
- Users can share forms and collect submissions
- Complete, functional demo product
- AI features, publishing workflow, and submission viewing added later

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Optional tests are clearly marked - skip entire test sections if not doing TDD
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- AI features (US5, US6) require OPENAI_API_KEY but core functionality works without it
- Verify all tasks follow the checklist format: `- [ ] [ID] [P?] [Story] Description with file path`

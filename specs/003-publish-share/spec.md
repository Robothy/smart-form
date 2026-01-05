# Feature Specification: Publish Button and Share Link Display

**Feature Branch**: `003-publish-share`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "As a form creator, I want to see the publish button in the edit form page. I want to see the share link in the published form view and form list."

## Clarifications

### Session 2026-01-05

- Q: Where should the Publish, Copy Share Link, and Add Field buttons be positioned in the edit form and form detail views? → A: Publish button and Copy Share Link button at TOP of form; Add Field button at BOTTOM of form
- Q: When a published form is edited, should changes be immediately visible to users accessing the form via the share link, or should there be a review/approval step? → A: Published forms cannot be edited again; creators can copy the form to make a new version
- Q: When a creator copies a published form, should the new draft copy have a reference to the original form, or should it be completely independent? → A: Completely independent - no reference to the original form
- Q: What visual indication should show that a form is published and read-only on the detail page? → A: A "Published" badge/label combined with read-only styling on all fields
- Q: How should the form list display share links for published forms - as the full URL, an abbreviated version, or just a share icon button? → A: Share icon button - clicking shows link in popup/dropdown
- Q: After successfully publishing a form, what should happen next - stay on edit page, redirect to detail view, or show a confirmation dialog? → A: Redirect to the published form's read-only detail view

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publish Form from Edit Page (Priority: P1)

As a form creator, I want to publish a form directly from the edit page so that I can make it available to users without navigating away from my work.

**Why this priority**: This is the core functionality requested. Without a publish button, forms cannot be shared publicly, which is the primary purpose of this feature.

**Independent Test**: Can be fully tested by creating a draft form, clicking the publish button on the edit page, and verifying the form status changes to "published" with a shareable link generated.

**Acceptance Scenarios**:

1. **Given** a draft form exists with at least one field, **When** the user clicks the "Publish" button at the top of the edit page, **Then** the form status changes to "published" and the user is redirected to the read-only detail view
2. **Given** a form is already published, **When** the user views the edit page, **Then** the edit page is not accessible and the user is redirected to the form detail view with a read-only display
3. **Given** a draft form has no fields, **When** the user attempts to click "Publish", **Then** validation prevents publishing with an error message requiring at least one field

---

### User Story 2 - View Share Link on Published Form Detail Page (Priority: P2)

As a form creator, I want to see the shareable link on the published form's detail page so that I can easily copy and share it with others.

**Why this priority**: Once a form is published, users need an easy way to access and share the link. This is a natural follow-up to publishing but has less priority than the publish action itself.

**Independent Test**: Can be fully tested by publishing a form, navigating to the form detail (view) page, and verifying a shareable link is displayed with a copy action.

**Acceptance Scenarios**:

1. **Given** a form is published, **When** the user views the form detail page, **Then** a shareable link section is visible at the top of the page showing the public URL
2. **Given** a shareable link is displayed at the top of the detail page, **When** the user clicks a "Copy" button next to it, **Then** the link is copied to the clipboard and a confirmation message appears
3. **Given** a form is in draft status, **When** the user views the form detail page, **Then** no shareable link is displayed (or a placeholder indicates "Form not published")

---

### User Story 3 - View Share Link in Form List (Priority: P3)

As a form creator, I want to see shareable links for published forms directly in the form list so that I can quickly access or copy links without opening each form individually.

**Why this priority**: This is a convenience feature that improves workflow efficiency. Users can still access share links via the detail page (US2), so this is lower priority.

**Independent Test**: Can be fully tested by publishing multiple forms, viewing the form list, and verifying published forms show shareable links or quick-access actions.

**Acceptance Scenarios**:

1. **Given** multiple forms exist with mixed statuses, **When** the user views the form list, **Then** published forms display a share icon button
2. **Given** a published form in the list, **When** the user clicks the share icon button, **Then** a popup or dropdown shows the full shareable link with a copy option
3. **Given** a draft form in the list, **When** displayed in the form list, **Then** no share icon button is shown for that form

---

### Edge Cases

- Publishing a form with validation errors (e.g., required fields missing, invalid field configurations) is prevented with clear error messaging
- Duplicate share slugs are handled by appending a unique suffix (e.g., timestamp or random string)
- Published forms cannot be edited - attempting to access the edit page redirects to the read-only detail view
- To modify a published form, the creator must copy it to create a new draft version
- Share link display adapts to mobile devices and smaller screens (buttons stack or use responsive layout)
- If the database operation to generate a unique slug fails, the user sees an error message and can retry publishing

## Requirements *(mandatory)*

### Functional Requirements

**UI Layout & Button Placement**:
- **FR-001**: System MUST provide a "Publish" button at the TOP of the form edit page for draft forms
- **FR-002**: System MUST place the "Copy Share Link" button at the TOP of the form detail page for published forms
- **FR-003**: System MUST place the "Add Field" button at the BOTTOM of the form in both edit and detail views
- **FR-004**: System MUST change form status from "draft" to "published" when the publish action is successfully completed
- **FR-015**: System MUST redirect the user to the read-only detail view after successfully publishing a form
- **FR-016**: System MUST display a "Published" badge/label on the detail page for published forms
- **FR-018**: System MUST apply read-only styling to all fields on published form detail pages

**Share Link Generation**:
- **FR-005**: System MUST generate a unique shareable slug for each form at publish time
- **FR-006**: System MUST display a shareable link at the TOP of the published form detail/view page
- **FR-007**: System MUST provide a "Copy" action next to shareable links that copies the URL to clipboard

**Validation**:
- **FR-008**: System MUST validate that a form has at least one field before allowing publish
- **FR-009**: System MUST prevent publishing forms with invalid field configurations

**Form List Display**:
- **FR-010**: System MUST display a share icon button for published forms in the form list view
- **FR-011**: System MUST show the full share link in a popup/dropdown when the share icon button is clicked
- **FR-017**: System MUST NOT display share icon buttons for draft forms in the form list

**State Management**:
- **FR-012**: System MUST prevent editing of published forms - edit page access redirects to read-only detail view
- **FR-013**: System MUST provide a "Copy Form" action for published forms that creates a completely independent new draft version with no reference to the original
- **FR-014**: System MUST handle duplicate slug generation by appending a unique suffix (e.g., timestamp or random string)

### Key Entities

- **Form**: Represents a form with fields, status (draft/published), and metadata (title, description, created/updated dates)
- **Share Slug**: A unique, URL-friendly identifier generated from the form title (used to create shareable links)
- **Share Link**: The complete public URL composed of base domain + "/forms/share/" + share slug

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can publish a form from the edit page in a single click (under 2 seconds from button click to completion)
- **SC-002**: Published forms display a shareable link at the top of the detail page visible within 1 second of page load
- **SC-003**: Users can copy a share link to clipboard in one action (click/tap) with visual confirmation
- **SC-004**: 95% of users successfully publish a form on their first attempt without errors
- **SC-005**: Share link generation succeeds for 100% of valid forms (no failed publishes due to slug conflicts)
- **SC-006**: Form list displays share actions for all published forms without requiring additional page loads
- **SC-007**: UI controls are positioned according to layout specification (Publish/Copy at TOP, Add Field at BOTTOM) for 100% of form views
- **SC-008**: Published forms display a "Published" badge and read-only field styling on the detail page

### Assumptions

- The base URL for share links follows the pattern: `[domain]/forms/share/[slug]`
- Share slugs are generated from form titles using URL-friendly character replacement (e.g., spaces to hyphens, special characters removed)
- Published forms are immutable - they cannot be edited after publishing
- To modify a published form, creators copy it to create a new draft version with a new share slug when published
- No authentication or authorization is required to access a published form via its share link (forms are public)
- Form creators are the only users who can publish forms (no multi-user permissions in scope)
- TOP of form refers to a header/action bar area; BOTTOM refers to a footer area below all form fields

# Feature Specification: CSS Centralization and Theme Reuse

**Feature Branch**: 05-css-refactor
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "Let's refactor the css inside *.tsx files. Those contents are verbose and not good for maintaince, can we centralize those styles and reuse common themes for better maintaince?"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Updates Design System (Priority: P1)

A developer needs to update a color or gradient used throughout the application. Instead of finding and replacing the same value across 20+ component files, they update a single theme constant, and all components reflect the change automatically.

**Why this priority**: This is the core value proposition of the feature. Reducing duplication and centralizing styles dramatically improves maintainability and reduces the risk of inconsistencies.

**Independent Test**: Create a theme constant file with a primary gradient definition. Replace inline gradient definitions in 2-3 components with references to the constant. Verify that changing the constant updates all components.

**Acceptance Scenarios**:

1. **Given** a developer needs to change the primary button gradient from indigo-purple to blue-teal, **When** they update the gradient in the theme constants file, **Then** all buttons using that theme constant automatically reflect the new gradient
2. **Given** a new component needs a primary button, **When** the developer applies the button style constant, **Then** the button matches the existing design system without copying inline styles
3. **Given** a component uses both sx prop and CSS variables, **When** the CSS variable value changes, **Then** both inline and stylesheet-based styles update consistently

---

### User Story 2 - Developer Creates Consistent New Components (Priority: P2)

A developer creates a new component that needs to match the existing design system. They can quickly discover and apply the appropriate theme constants (colors, spacing, typography, effects) without examining existing component code.

**Why this priority**: Improves developer velocity and ensures design consistency. Without centralized themes, developers either copy-paste inconsistent styles or spend time hunting for the "right" values.

**Independent Test**: Document theme constants in a clear format. Create a new component using only theme constants (no hardcoded values). Verify the component matches the existing visual style.

**Acceptance Scenarios**:

1. **Given** a developer is creating a new card component, **When** they reference the theme constants for spacing, colors, and shadows, **Then** the card visually matches existing card components
2. **Given** a developer needs a success badge, **When** they apply the status badge theme constant, **Then** the badge matches the existing success badge styling
3. **Given** the theme constants are organized by category (colors, spacing, typography, components), **When** a developer browses the constants file, **Then** they can quickly find the style pattern they need

---

### User Story 3 - Team Reduces Style Duplication (Priority: P3)

The development team can measure the reduction in duplicated style definitions across the codebase. Common patterns like gradients, shadows, and glassmorphism effects are defined once and reused.

**Why this priority**: Provides measurable benefits for code maintainability and bundle size. Lower priority because the value is cumulative rather than immediate functionality.

**Independent Test**: Audit the codebase before and after refactoring. Count occurrences of duplicated gradient definitions, shadow values, and color codes. Verify reduction in duplication.

**Acceptance Scenarios**:

1. **Given** the codebase has 20+ duplicate gradient definitions, **When** refactoring is complete, **Then** each unique gradient is defined exactly once in the theme constants
2. **Given** components use hardcoded color values like #6366f1, **When** refactoring is complete, **Then** these are replaced with named theme constants or CSS variable references
3. **Given** multiple components define identical glassmorphism effects, **When** refactoring is complete, **Then** a single glassmorphism style constant is reused across all components

---

### Edge Cases

- What happens when a component needs a one-off variation of a theme style?
  - Theme constants should support composition and overrides (e.g., spread operators, utility functions)
- How does the system handle responsive breakpoints in theme constants?
  - Include breakpoint-aware styles in constants where applicable (e.g., { xs: 2, sm: 3 })
- What if CSS variables and theme constants conflict?
  - Establish convention: CSS variables for global values, theme constants for component-specific compositions
- How are dark/light mode considerations handled?
  - Theme constants should leverage existing CSS variables that already support theming

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a centralized theme constants file containing reusable style definitions
- **FR-002**: Theme constants MUST include categories for colors, gradients, shadows, spacing, typography, and common component styles (buttons, cards, badges, toolbars)
- **FR-003**: Theme constants MUST be strongly typed for developer discoverability and type safety
- **FR-004**: Theme constants MUST support composition (combining multiple constants) and overrides (extending constants with custom values)
- **FR-005**: Refactored components MUST use theme constants instead of hardcoded style values where a constant exists
- **FR-006**: System MUST leverage existing CSS variables defined in globals.css within theme constants
- **FR-007**: Documentation or comments MUST explain the purpose and usage of each theme constant category
- **FR-008**: Refactoring MUST maintain visual consistency - no visual changes to the application appearance

### Key Entities

- **Theme Constants File**: Central TypeScript module exporting categorized style objects (colors, gradients, shadows, spacing, component styles)
- **Style Category**: A group of related style constants (e.g., "buttons" category containing primary, secondary, success variants)
- **Component Style Mapping**: The association between existing component inline styles and their corresponding theme constants

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can update a design token (color, gradient, shadow) in one location and see changes reflected across all components using that token
- **SC-002**: New components can be created using 100% theme constants without copying inline styles from existing components
- **SC-003**: Code audit shows at least 80% reduction in duplicated style definitions (gradients, shadows, color codes) across component files
- **SC-004**: Visual regression testing confirms zero visual changes - the application looks identical before and after refactoring
- **SC-005**: Developer time to style a new component is reduced by at least 50% compared to copying inline styles

## Assumptions

1. The existing CSS variables in globals.css provide a solid foundation and should be leveraged rather than replaced
2. The application uses a dark theme consistently - light mode variants are not currently required
3. MUI (Material-UI) is the primary component library and the sx prop pattern will continue to be used
4. TypeScript is available for type-safe theme constants
5. The codebase uses Next.js 15+ with the App Router
6. Approximately 19 component files contain inline styles that need refactoring
7. The most complex inline styling is in FormInput.tsx (~150 lines for date picker styling)
8. Common patterns identified include: primary/secondary buttons, status badges, glassmorphism toolbars, card styles, and table/pagination styles

## Out of Scope

- Migrating from MUI to a different component library
- Introducing a CSS-in-JS library (styled-components, emotion, etc.)
- Changing the visual design or appearance of the application
- Performance optimization beyond what centralization naturally provides
- Creating a design system documentation site or Storybook integration
- Refactoring styles in non-TSX files (globals.css, module.css files)
- Automated tooling for detecting style violations (this could be a future enhancement)

## Dependencies

- Existing CSS variables in globals.css serve as the source of truth for colors and spacing values
- Component files identified in the exploration analysis (19 files with inline styles)
- TypeScript for type-safe theme constant exports

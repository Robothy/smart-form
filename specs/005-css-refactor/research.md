# Research: CSS Centralization and Theme Reuse

**Feature**: 005-css-refactor
**Date**: 2026-01-06
**Status**: Complete

## Overview

This research document captures the technical decisions and best practices for centralizing inline CSS styles in the simple-form codebase. The goal is to reduce duplication, improve maintainability, and establish a consistent theme system.

## Key Decisions

### Decision 1: Theme Constants File Structure

**Choice**: Create a `lib/theme/` directory with modular TypeScript files

**Rationale**:
- Modularity allows for clear separation of concerns (colors, components, utilities)
- TypeScript provides type safety and IDE autocompletion
- Located under `lib/` matches existing project structure (lib/db, lib/utils, lib/validation)
- Easy to import as `import { buttonStyles } from '@/theme/components'`

**Alternatives Considered**:
- Single monolithic `theme.ts` file: Rejected because it would become unwieldy with 19+ components to refactor
- MUI theme customization: Rejected because existing codebase uses `sx` prop extensively; switching to MUI theme would require rewriting all component styling
- CSS-in-JS library (styled-components, emotion): Explicitly out of scope per spec

### Decision 2: Theme Constant Categories

**Choice**: Organize constants into five categories

1. **`colors.ts`** - Color values and semantic color mappings
2. **`gradients.ts`** - Gradient definitions for buttons, badges, backgrounds
3. **`spacing.ts`** - Spacing scale and common padding/margin patterns
4. **`shadows.ts`** - Shadow definitions for depth and elevation
5. **`components.ts`** - Pre-built style objects for common UI elements (buttons, cards, badges, toolbars)

**Rationale**:
- Mirrors the existing CSS variable structure in `globals.css`
- Each category addresses a specific duplication pattern identified in codebase analysis
- Component styles can compose from multiple categories (e.g., button = color + gradient + shadow)

**File Structure**:
```text
lib/theme/
├── index.ts           # Main export file
├── colors.ts          # Color constants
├── gradients.ts       # Gradient definitions
├── spacing.ts         # Spacing scale
├── shadows.ts         # Shadow definitions
└── components.ts      # Component style compositions
```

### Decision 3: Typing Strategy

**Choice**: Use MUI's `SxProps` type for component style constants

**Rationale**:
- MUI's `SxProps<Theme>` is the standard type for `sx` prop values
- Provides autocomplete for valid CSS properties
- Supports responsive breakpoint syntax (`{ xs: 2, sm: 3 }`)
- Leverages existing MUI types without additional dependencies

**Type Definition Pattern**:
```typescript
import { SxProps } from '@mui/material/styles';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

export const buttonStyles: Record<ButtonVariant, SxProps<Theme>> = {
  primary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    // ...
  },
  // ...
};
```

### Decision 4: CSS Variable Integration

**Choice**: Reference CSS variables in theme constants using `var(--variable-name)` syntax

**Rationale**:
- Leverages existing investment in `globals.css` CSS variables
- Single source of truth for global values
- Theme constants compose CSS variables into reusable component patterns
- Maintains consistency between global styles and component styles

**Example**:
```typescript
// components.ts
export const glassSurface: SxProps<Theme> = {
  background: 'var(--color-surface)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--color-border)',
};
```

### Decision 5: Composition and Overrides

**Choice**: Support composition via spread operator and overrides via object merging

**Rationale**:
- JavaScript/TypeScript object spread is idiomatic and well-understood
- Allows one-off variations without defining new constants
- MUI `sx` prop naturally merges style objects
- No additional utility functions required

**Usage Pattern**:
```typescript
// Using a constant directly
<Button sx={buttonStyles.primary} />

// Composing multiple constants
<Box sx={{ ...glassSurface, ...flexCenter }} />

// Overriding specific properties
<Button sx={{ ...buttonStyles.primary, fontSize: '0.875rem' }} />
```

### Decision 6: Documentation Approach

**Choice**: JSDoc comments on exports + category comments in files

**Rationale**:
- JSDoc provides hover tooltips in IDE
- File-level comments explain category purpose and usage patterns
- No separate documentation site needed (out of scope per spec)
- Comments serve as inline documentation for developers

**Example**:
```typescript
/**
 * Primary button style with indigo-purple gradient
 * @example <Button sx={buttonStyles.primary}>Click me</Button>
 */
export const primary: SxProps<Theme> = { /* ... */ };
```

## Common Patterns Identified

### Pattern 1: Gradient Buttons

**Locations**: 15+ occurrences across components
- `app/forms/page.tsx`
- `components/forms/FormCard.tsx`
- `components/ui/FormFiller.tsx`
- `components/forms/ShareLinkDisplay.tsx`

**Current Duplication**:
```typescript
sx={{
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
  }
}}
```

**Centralized Constant**:
```typescript
// components.ts - buttonStyles.primary
export const primary: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  color: '#ffffff',
  fontWeight: 600,
  px: 3,
  py: 1.5,
  borderRadius: 2,
  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
  },
};
```

### Pattern 2: Glassmorphism Surfaces

**Locations**: Toolbar, navbar, modal backgrounds
- `components/forms/EditToolbar.tsx`
- `components/forms/NavBar.tsx`
- `app/forms/page.tsx`

**Current Duplication**:
```typescript
sx={{
  background: 'rgba(10, 10, 15, 0.85)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
}}
```

**Centralized Constant**:
```typescript
// components.ts - layoutStyles.glassToolbar
export const glassToolbar: SxProps<Theme> = {
  background: 'rgba(10, 10, 15, 0.85)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--color-border)',
  position: 'sticky',
  top: 0,
  zIndex: 1030,
};
```

### Pattern 3: Status Badges

**Locations**: Form status indicators in list and detail views
- `components/forms/FormStatusBadge.tsx`
- `components/forms/FormCard.tsx`

**Current Duplication**:
```typescript
// Published badge
sx={{
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
  color: '#10b981',
  border: '1px solid rgba(16, 185, 129, 0.3)',
}}

// Draft badge
sx={{
  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
  color: '#f59e0b',
  border: '1px solid rgba(245, 158, 11, 0.3)',
}}
```

**Centralized Constant**:
```typescript
// components.ts - badgeStyles
export const badgeStyles = {
  published: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
    color: 'var(--color-success)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  } as SxProps<Theme>,
  draft: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
    color: 'var(--color-warning)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  } as SxProps<Theme>,
};
```

## Implementation Considerations

### Visual Consistency

**Requirement**: FR-008 states "Refactoring MUST maintain visual consistency - no visual changes to the application appearance"

**Approach**:
1. Extract exact values from existing inline styles
2. Create theme constants with identical values
3. Replace inline styles with constant references
4. Use visual regression testing (screenshot comparison) to verify no changes

**Validation**:
- Manual visual inspection of all pages
- Screenshot comparison before/after (if automated tooling available)
- Run existing test suite to ensure no functional regressions

### Migration Strategy

**Incremental Refactoring**:
1. Create theme constants file with all identified patterns
2. Migrate components one at a time (highest duplication first)
3. Test each component individually after migration
4. Commit changes per component or small batches

**Priority Order** (by duplication count):
1. `components/ui/FormInput.tsx` (~150 lines of date picker styles)
2. `app/forms/page.tsx` (~50 lines of toolbar/button styles)
3. `components/forms/FormCard.tsx` (~40 lines of card/button styles)
4. Remaining 16 files with 10-30 lines each

### Responsive Breakpoints

**Convention**: Use MUI's breakpoint syntax in constants where applicable

```typescript
export const responsivePadding: SxProps<Theme> = {
  px: { xs: 2, sm: 3, md: 4 },
  py: { xs: 1.5, sm: 2, md: 2.5 },
};
```

## Best Practices for MUI sx Prop with TypeScript

### Type Safety

Always import `SxProps` from `@mui/material/styles`:

```typescript
import { SxProps } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';

export const myStyle: SxProps<Theme> = {
  // TypeScript validates CSS properties
  color: 'var(--color-text-primary)',
  p: 2,
};
```

### Pseudo-selectors and Nested Selectors

Use MUI's nested syntax for hover, focus, and other states:

```typescript
export const interactiveButton: SxProps<Theme> = {
  backgroundColor: 'primary.main',
  '&:hover': {
    backgroundColor: 'primary.dark',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
};
```

### Media Queries

Use MUI breakpoint object syntax for responsive styles:

```typescript
export const responsiveText: SxProps<Theme> = {
  fontSize: '1rem',
  // Mobile-first responsive
  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
};
```

## Dependencies and Integration

### Existing CSS Variables

The following CSS variables from `globals.css` should be referenced in theme constants:

**Colors**:
- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`
- `--color-surface`, `--color-surface-hover`
- `--color-accent-primary`, `--color-accent-secondary`
- `--color-success`, `--color-warning`, `--color-error`, `--color-info`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-border`, `--color-border-hover`, `--color-border-focus`

**Shadows**:
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- `--shadow-glow`, `--shadow-glow-lg`

**Spacing**:
- `--space-1` through `--space-20`

**Border Radius**:
- `--radius-sm` through `--radius-full`

**Transitions**:
- `--transition-fast`, `--transition-base`, `--transition-slow`

### MUI Integration

The project uses MUI v6 with the following theme customization:
- Custom palette via CSS variables
- Dark theme as default
- Custom component overrides in `globals.css`

Theme constants should work with existing MUI theme, not replace it.

## Unresolved Questions (None)

All technical decisions have been resolved. No NEEDS CLARIFICATION items remain.

## References

- MUI System `sx` Prop Documentation: https://mui.com/system/getting-started/the-sx-prop/
- TypeScript with MUI: https://mui.com/material-ui/guides/typescript/
- CSS Variables Best Practices: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

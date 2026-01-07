# Quickstart Guide: CSS Centralization and Theme Reuse

**Feature**: 005-css-refactor
**Date**: 2026-01-06

## Overview

This guide helps you start using the centralized theme constants in your components. The theme system provides reusable, type-safe style objects that replace verbose inline styles.

## Installation

No installation required. The theme constants are part of the codebase at `lib/theme/`.

## Basic Usage

### Import Theme Constants

```typescript
// Import from the theme module
import { buttonStyles, badgeStyles, layoutStyles } from '@/theme/components';
```

### Use in Components

```typescript
import { buttonStyles } from '@/theme/components';

function MyComponent() {
  return (
    <Button sx={buttonStyles.primary}>
      Click Me
    </Button>
  );
}
```

## Available Constants

### Button Styles

```typescript
import { buttonStyles } from '@/theme/components';

<Button sx={buttonStyles.primary}>Primary Action</Button>
<Button sx={buttonStyles.secondary}>Secondary</Button>
<Button sx={buttonStyles.success}>Success</Button>
<Button sx={buttonStyles.danger}>Delete</Button>
<Button sx={buttonStyles.ghost}>Cancel</Button>
```

### Badge Styles

```typescript
import { badgeStyles } from '@/theme/components';

<Chip sx={badgeStyles.published}>Published</Chip>
<Chip sx={badgeStyles.draft}>Draft</Chip>
<Chip sx={badgeStyles.archived}>Archived</Chip>
```

### Layout Styles

```typescript
import { layoutStyles } from '@/theme/components';

// Glassmorphism toolbar
<Box sx={layoutStyles.glassToolbar}>...</Box>

// Card container
<Paper sx={layoutStyles.cardContainer}>...</Paper>

// Page container
<Box sx={layoutStyles.pageContainer}>...</Box>
```

### Form Styles

```typescript
import { formStyles } from '@/theme/components';

<TextField sx={formStyles.input} />
<Select sx={formStyles.select} />
```

## Composition and Overrides

### Compose Multiple Constants

```typescript
import { layoutStyles, flexStyles } from '@/theme/components';

<Box sx={{ ...layoutStyles.glassSurface, ...flexStyles.center }}>
  Centered content
</Box>
```

### Override Specific Properties

```typescript
import { buttonStyles } from '@/theme/components';

// Override padding
<Button sx={{ ...buttonStyles.primary, px: 4 }}>
  Wide Button
</Button>

// Override color
<Button sx={{ ...buttonStyles.primary, background: '#custom-color' }}>
  Custom Button
</Button>
```

### Add One-Off Styles

```typescript
import { buttonStyles } from '@/theme/components';

// Combine constant with custom styles
<Button sx={{
  ...buttonStyles.primary,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}}>
  Styled Button
</Button>
```

## Common Patterns

### Gradient Button with Hover Effect

```typescript
import { buttonStyles } from '@/theme/components';

<Button sx={buttonStyles.primary} startIcon={<AddIcon />}>
  New Form
</Button>
```

### Status Badge

```typescript
import { badgeStyles } from '@/theme/components';

<Chip
  sx={form.status === 'published' ? badgeStyles.published : badgeStyles.draft}
  label={form.status}
/>
```

### Glassmorphism Card

```typescript
import { layoutStyles } from '@/theme/components';

<Paper sx={layoutStyles.glassCard}>
  <Typography variant="h6">Card Title</Typography>
  <Typography>Card content goes here...</Typography>
</Paper>
```

### Responsive Spacing

```typescript
import { spacingStyles } from '@/theme/components';

<Box sx={spacingStyles.responsivePadding}>
  Responsive padding
</Box>
```

## Migration Guide

### Before: Inline Styles

```typescript
<Button
  sx={{
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
    },
  }}
>
  Create Form
</Button>
```

### After: Theme Constant

```typescript
import { buttonStyles } from '@/theme/components';

<Button sx={buttonStyles.primary}>
  Create Form
</Button>
```

## Type Safety

All theme constants are fully typed with MUI's `SxProps<Theme>`:

```typescript
import { buttonStyles } from '@/theme/components';
import type { SxProps } from '@mui/material/styles';

// TypeScript validates style properties
const customStyle: SxProps<Theme> = {
  color: 'var(--color-text-primary)',
  p: 2,
};
```

## Using CSS Variables

Theme constants reference CSS variables from `globals.css`:

```typescript
// Available CSS variables
const colors = {
  bgPrimary: 'var(--color-bg-primary)',
  bgSecondary: 'var(--color-bg-secondary)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  accent: 'var(--color-accent-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  border: 'var(--color-border)',
};

// Use in your components
<Box sx={{ backgroundColor: colors.bgSecondary }}>
  Content
</Box>
```

## Creating New Constants

If you need a new style pattern that doesn't exist:

1. **Check existing constants first** - your pattern might already exist
2. **Add to appropriate file** in `lib/theme/`:
   - `colors.ts` for color values
   - `gradients.ts` for gradients
   - `spacing.ts` for spacing patterns
   - `shadows.ts` for shadows
   - `components.ts` for component compositions

3. **Export with JSDoc documentation**:

```typescript
/**
 * Custom button style for special actions
 * @example <Button sx={buttonStyles.special}>Special Action</Button>
 */
export const special: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  // ... rest of styles
};
```

## Best Practices

1. **Always prefer constants over inline styles** - Check if a constant exists before writing inline styles
2. **Use composition for variations** - Spread multiple constants instead of creating new ones
3. **Override sparingly** - Only override when you truly need a one-off variation
4. **Document your constants** - Add JSDoc comments explaining usage
5. **Follow existing patterns** - Match the style and naming of existing constants

## Troubleshooting

### Styles Not Applying

1. Check that you imported the constant correctly
2. Verify the constant exists in `lib/theme/`
3. Check for conflicting inline styles (inline styles override constants)

### Type Errors

1. Make sure you imported `SxProps` type
2. Check that CSS property names are valid
3. Verify CSS variables exist in `globals.css`

### Responsive Styles Not Working

1. Use MUI breakpoint syntax: `{ xs: 2, sm: 3, md: 4 }`
2. Don't use media queries in `sx` prop (use breakpoint objects instead)

## Resources

- MUI `sx` Prop Documentation: https://mui.com/system/getting-started/the-sx-prop/
- CSS Variables in `globals.css`: See `app/globals.css` for full list
- TypeScript with MUI: https://mui.com/material-ui/guides/typescript/

## Support

For questions or issues:
1. Check this quickstart guide
2. Review existing constants in `lib/theme/`
3. Refer to MUI documentation
4. Ask the team in project chat

/**
 * Spacing Constants
 *
 * Spacing scale constants for consistent margins and padding.
 * Values reference CSS variables from globals.css.
 *
 * @example
 * import { spacing } from '@/theme';
 * <Box sx={{ p: spacing.md }}>Content</Box>
 */

import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Spacing scale values matching CSS variables
 */
export const spacing = {
  xs: 'var(--space-1)',   // 0.25rem
  sm: 'var(--space-2)',   // 0.5rem
  md: 'var(--space-3)',   // 0.75rem
  lg: 'var(--space-4)',   // 1rem
  xl: 'var(--space-5)',   // 1.25rem
  '2xl': 'var(--space-6)', // 1.5rem
  '3xl': 'var(--space-8)', // 2rem
  '4xl': 'var(--space-10)', // 2.5rem
  '5xl': 'var(--space-12)', // 3rem
  '6xl': 'var(--space-16)', // 4rem
  '7xl': 'var(--space-20)', // 5rem
} as const;

/**
 * Pre-defined spacing style objects for common use cases
 */
export const spacingStyles: {
  /** Compact padding */
  compact: SxProps<Theme>;
  /** Normal padding */
  normal: SxProps<Theme>;
  /** Comfortable padding */
  comfortable: SxProps<Theme>;
  /** Spacious padding */
  spacious: SxProps<Theme>;
  /** Responsive padding */
  responsivePadding: SxProps<Theme>;
  /** Responsive margin */
  responsiveMargin: SxProps<Theme>;
} = {
  compact: {
    px: 2,
    py: 1,
  },
  normal: {
    px: 3,
    py: 1.5,
  },
  comfortable: {
    px: 4,
    py: 2.5,
  },
  spacious: {
    px: 6,
    py: 4,
  },
  responsivePadding: {
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 1.5, sm: 2, md: 2.5 },
  },
  responsiveMargin: {
    mx: { xs: 2, sm: 3, md: 4 },
    my: { xs: 1.5, sm: 2, md: 2.5 },
  },
};

/**
 * Common container padding patterns
 */
export const containerPadding: SxProps<Theme> = {
  px: { xs: 2, sm: 3, md: 4 },
  py: { xs: 1.5, sm: 2, md: 2.5 },
};

/**
 * Gap spacing for flex/grid layouts
 */
export const gapStyles: {
  /** Small gap */
  sm: SxProps<Theme>;
  /** Medium gap */
  md: SxProps<Theme>;
  /** Large gap */
  lg: SxProps<Theme>;
} = {
  sm: {
    gap: 2,
  },
  md: {
    gap: 3,
  },
  lg: {
    gap: 4,
  },
};

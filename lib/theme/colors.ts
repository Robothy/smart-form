/**
 * Color Constants
 *
 * Color values referencing CSS variables from globals.css.
 * Use these constants for consistent color usage across components.
 *
 * @example
 * import { colors } from '@/theme';
 * <Box sx={{ backgroundColor: colors.bgSecondary }}>Content</Box>
 */

import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Color constants object for easy access to CSS variables
 */
export const colors = {
  // Background colors
  bgPrimary: 'var(--color-bg-primary)',
  bgSecondary: 'var(--color-bg-secondary)',
  bgTertiary: 'var(--color-bg-tertiary)',
  bgElevated: 'var(--color-bg-elevated)',

  // Surface colors
  surface: 'var(--color-surface)',
  surfaceHover: 'var(--color-surface-hover)',
  surfaceActive: 'var(--color-surface-active)',

  // Accent colors
  accentPrimary: 'var(--color-accent-primary)',
  accentSecondary: 'var(--color-accent-secondary)',
  accentTertiary: 'var(--color-accent-tertiary)',
  accentGradient: 'var(--color-accent-gradient)',

  // Semantic colors
  success: 'var(--color-success)',
  successBg: 'var(--color-success-bg)',
  warning: 'var(--color-warning)',
  warningBg: 'var(--color-warning-bg)',
  error: 'var(--color-error)',
  errorBg: 'var(--color-error-bg)',
  info: 'var(--color-info)',
  infoBg: 'var(--color-info-bg)',

  // Text colors
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textTertiary: 'var(--color-text-tertiary)',
  textMuted: 'var(--color-text-muted)',

  // Border colors
  border: 'var(--color-border)',
  borderHover: 'var(--color-border-hover)',
  borderFocus: 'var(--color-border-focus)',
} as const;

/**
 * Style objects for common color applications
 */
export const colorStyles: {
  /** Primary text style */
  textPrimary: SxProps<Theme>;
  /** Secondary text style */
  textSecondary: SxProps<Theme>;
  /** Success text style */
  textSuccess: SxProps<Theme>;
  /** Warning text style */
  textWarning: SxProps<Theme>;
  /** Error text style */
  textError: SxProps<Theme>;
} = {
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textSuccess: {
    color: colors.success,
  },
  textWarning: {
    color: colors.warning,
  },
  textError: {
    color: colors.error,
  },
};

/**
 * Background style objects
 */
export const backgroundStyles: {
  /** Primary background */
  primary: SxProps<Theme>;
  /** Secondary background */
  secondary: SxProps<Theme>;
  /** Surface background */
  surface: SxProps<Theme>;
} = {
  primary: {
    backgroundColor: colors.bgPrimary,
  },
  secondary: {
    backgroundColor: colors.bgSecondary,
  },
  surface: {
    backgroundColor: colors.surface,
  },
};

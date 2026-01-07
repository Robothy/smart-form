/**
 * Shadow Constants
 *
 * Shadow definitions for depth and elevation.
 * Values reference CSS variables from globals.css.
 *
 * @example
 * import { shadows } from '@/theme';
 * <Paper sx={{ boxShadow: shadows.md }}>Content</Paper>
 */

import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Shadow scale matching CSS variables
 */
export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  glow: 'var(--shadow-glow)',
  glowLg: 'var(--shadow-glow-lg)',
} as const;

/**
 * Shadow style objects for common elevation levels
 */
export const shadowStyles: {
  /** Small shadow for cards and panels */
  card: SxProps<Theme>;
  /** Medium shadow for dropdowns and menus */
  dropdown: SxProps<Theme>;
  /** Large shadow for modals and dialogs */
  modal: SxProps<Theme>;
  /** Glow effect for interactive elements */
  glow: SxProps<Theme>;
  /** Large glow effect for CTAs */
  glowLg: SxProps<Theme>;
} = {
  card: {
    boxShadow: shadows.md,
  },
  dropdown: {
    boxShadow: shadows.lg,
  },
  modal: {
    boxShadow: shadows.xl,
  },
  glow: {
    boxShadow: shadows.glow,
  },
  glowLg: {
    boxShadow: shadows.glowLg,
  },
};

/**
 * Button shadow styles
 */
export const buttonShadows: {
  /** Primary button glow shadow */
  primary: SxProps<Theme>;
  /** Success button glow shadow */
  success: SxProps<Theme>;
  /** Warning button glow shadow */
  warning: SxProps<Theme>;
  /** Danger button glow shadow */
  danger: SxProps<Theme>;
} = {
  primary: {
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
    },
  },
  success: {
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)',
    },
  },
  warning: {
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(245, 158, 11, 0.5)',
    },
  },
  danger: {
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(239, 68, 68, 0.5)',
    },
  },
};

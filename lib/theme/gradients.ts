/**
 * Gradient Constants
 *
 * Gradient definitions for buttons, badges, and visual effects.
 * All gradients match the existing inline styles from components.
 *
 * @example
 * import { gradients } from '@/theme';
 * <Button sx={{ background: gradients.primary }}>Button</Button>
 */

import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Primary gradient (indigo-purple)
 * Used for: Primary buttons, primary actions
 */
export const primary: string = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';

/**
 * Secondary gradient (purple-pink)
 * Used for: Secondary buttons, decorative elements
 */
export const secondary: string = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';

/**
 * Success gradient (green)
 * Used for: Success buttons, success badges
 */
export const success: string = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

/**
 * Warning gradient (amber-orange)
 * Used for: Warning buttons, draft badges
 */
export const warning: string = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

/**
 * Danger gradient (red)
 * Used for: Delete buttons, error states
 */
export const danger: string = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

/**
 * Info gradient (blue)
 * Used for: Info buttons, informational badges
 */
export const info: string = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';

/**
 * Full accent gradient (indigo-purple-pink)
 * Used for: Hero elements, gradient text
 */
export const accentFull: string = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)';

/**
 * Gradient style objects with backgrounds and shadows
 */
export const gradientStyles: {
  /** Primary gradient with shadow */
  primary: SxProps<Theme>;
  /** Secondary gradient with shadow */
  secondary: SxProps<Theme>;
  /** Success gradient with shadow */
  success: SxProps<Theme>;
  /** Warning gradient with shadow */
  warning: SxProps<Theme>;
  /** Danger gradient with shadow */
  danger: SxProps<Theme>;
  /** Ghost button style */
  ghost: SxProps<Theme>;
} = {
  primary: {
    background: primary,
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
    },
  },
  secondary: {
    background: secondary,
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)',
    },
  },
  success: {
    background: success,
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)',
    },
  },
  warning: {
    background: warning,
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(245, 158, 11, 0.5)',
    },
  },
  danger: {
    background: danger,
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(239, 68, 68, 0.5)',
    },
  },
  ghost: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    '&:hover': {
      background: 'var(--color-bg-secondary)',
      borderColor: 'var(--color-border-hover)',
    },
  },
};

/**
 * Badge gradient styles (subtle backgrounds for status indicators)
 */
export const badgeGradients: {
  /** Published badge gradient */
  published: SxProps<Theme>;
  /** Draft badge gradient */
  draft: SxProps<Theme>;
  /** Archived badge gradient */
  archived: SxProps<Theme>;
} = {
  published: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
    color: 'var(--color-success)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  draft: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
    color: 'var(--color-warning)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  archived: {
    background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(71, 85, 105, 0.15))',
    color: 'var(--color-text-tertiary)',
    border: '1px solid rgba(100, 116, 139, 0.3)',
  },
};

/**
 * Component Style Constants
 *
 * Pre-built style objects for common UI elements.
 * These compositions combine colors, gradients, shadows, and spacing
 * into reusable styles for buttons, badges, toolbars, cards, etc.
 *
 * @example
 * import { buttonStyles } from '@/theme/components';
 * <Button sx={buttonStyles.primary}>Click me</Button>
 */

import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Button variant type
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

/**
 * Button style constants
 * @example <Button sx={buttonStyles.primary}>Primary Action</Button>
 */
export const buttonStyles: Record<ButtonVariant, SxProps<Theme>> = {
  /**
   * Primary button with indigo-purple gradient
   * @example <Button sx={buttonStyles.primary} startIcon={<AddIcon />}>Create Form</Button>
   */
  primary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textTransform: 'none' as const,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  /**
   * Secondary button with purple-pink gradient
   * @example <Button sx={buttonStyles.secondary}>Secondary</Button>
   */
  secondary: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    color: '#ffffff',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textTransform: 'none' as const,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  /**
   * Success button with green gradient
   * @example <Button sx={buttonStyles.success}>Save</Button>
   */
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textTransform: 'none' as const,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  /**
   * Danger button with red gradient
   * @example <Button sx={buttonStyles.danger} startIcon={<DeleteIcon />}>Delete</Button>
   */
  danger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textTransform: 'none' as const,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(239, 68, 68, 0.5)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  /**
   * Ghost button with transparent background and border
   * @example <Button sx={buttonStyles.ghost}>Cancel</Button>
   */
  ghost: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    transition: 'all 0.2s',
    textTransform: 'none' as const,
    '&:hover': {
      background: 'var(--color-bg-secondary)',
      borderColor: 'var(--color-border-hover)',
    },
  },
};

/**
 * Badge status type
 */
export type BadgeStatus = 'published' | 'draft' | 'archived';

/**
 * Badge style constants for status indicators
 * @example <Chip sx={badgeStyles.published}>Published</Chip>
 */
export const badgeStyles: Record<BadgeStatus, SxProps<Theme>> = {
  /**
   * Published status badge
   * @example <Chip sx={badgeStyles.published} label="Published" />
   */
  published: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
    color: 'var(--color-success)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontWeight: 500,
    px: 2,
    py: 0.5,
  },

  /**
   * Draft status badge
   * @example <Chip sx={badgeStyles.draft} label="Draft" />
   */
  draft: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
    color: 'var(--color-warning)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    fontWeight: 500,
    px: 2,
    py: 0.5,
  },

  /**
   * Archived status badge
   * @example <Chip sx={badgeStyles.archived} label="Archived" />
   */
  archived: {
    background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(71, 85, 105, 0.15))',
    color: 'var(--color-text-tertiary)',
    border: '1px solid rgba(100, 116, 139, 0.3)',
    fontWeight: 500,
    px: 2,
    py: 0.5,
  },
};

/**
 * Layout style constants for containers and surfaces
 * @example <Box sx={layoutStyles.glassToolbar}>Toolbar content</Box>
 */
export const layoutStyles = {
  /**
   * Glassmorphism toolbar for sticky headers
   * @example <Box sx={layoutStyles.glassToolbar}>Toolbar</Box>
   */
  glassToolbar: {
    background: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--color-border)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1030,
  },

  /**
   * Glassmorphism surface for cards and panels
   * @example <Paper sx={layoutStyles.glassSurface}>Content</Paper>
   */
  glassSurface: {
    background: 'rgba(26, 26, 36, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--color-border)',
  },

  /**
   * Card container with elevation
   * @example <Paper sx={layoutStyles.cardContainer}>Card content</Paper>
   */
  cardContainer: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
    p: 3,
  },

  /**
   * Page container with responsive padding
   * @example <Box sx={layoutStyles.pageContainer}>Page content</Box>
   */
  pageContainer: {
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 1.5, sm: 2, md: 2.5 },
  },

  /**
   * Glassmorphism card with hover effect
   * @example <Paper sx={layoutStyles.glassCard}>Card content</Paper>
   */
  glassCard: {
    background: 'rgba(26, 26, 36, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    p: 3,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 'var(--shadow-xl)',
    },
  },
};

/**
 * Form style constants for inputs and form elements
 * @example <TextField sx={formStyles.input} />
 */
export const formStyles = {
  /**
   * Input field styling
   * @example <TextField sx={formStyles.input} label="Name" />
   */
  input: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'var(--color-bg-secondary)',
      '&:hover': {
        backgroundColor: 'var(--color-bg-secondary)',
      },
    },
  },

  /**
   * Select dropdown styling
   * @example <Select sx={formStyles.select} />
   */
  select: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
  },
};

/**
 * Flex layout utilities
 * @example <Box sx={flexStyles.center}>Centered content</Box>
 */
export const flexStyles = {
  /**
   * Flex center (both horizontal and vertical)
   * @example <Box sx={flexStyles.center}>Centered</Box>
   */
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /**
   * Flex column center
   * @example <Box sx={flexStyles.columnCenter}>Vertical center</Box>
   */
  columnCenter: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /**
   * Flex space between
   * @example <Box sx={flexStyles.between}>Space between</Box>
   */
  between: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /**
   * Flex gap utilities
   * @example <Box sx={flexStyles.gap.md}>Spaced items</Box>
   */
  gap: {
    sm: {
      display: 'flex',
      gap: 2,
    },
    md: {
      display: 'flex',
      gap: 3,
    },
    lg: {
      display: 'flex',
      gap: 4,
    },
  },
};

/**
 * Icon button style constants
 * @example <IconButton sx={iconStyles.button}><Icon /></IconButton>
 */
export const iconStyles = {
  /**
   * Standard icon button
   * @example <IconButton sx={iconStyles.button}><CopyIcon /></IconButton>
   */
  button: {
    color: 'var(--color-text-secondary)',
    transition: 'all 0.2s',
    '&:hover': {
      color: 'var(--color-text-primary)',
      backgroundColor: 'var(--color-bg-secondary)',
    },
  },

  /**
   * Primary icon button
   * @example <IconButton sx={iconStyles.primary}><AddIcon /></IconButton>
   */
  primary: {
    color: 'var(--color-accent-primary)',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
  },
};

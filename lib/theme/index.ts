/**
 * Theme Constants Module
 *
 * Centralized, type-safe style objects for consistent UI across the application.
 * All constants use MUI's SxProps<Theme> for full TypeScript support and IDE autocomplete.
 *
 * @module @/theme
 *
 * @example
 * import { buttonStyles, badgeStyles, layoutStyles } from '@/theme';
 *
 * // Button with gradient and hover effect
 * <Button sx={buttonStyles.primary}>Click me</Button>
 *
 * // Status badge
 * <Chip sx={badgeStyles.published}>Published</Chip>
 *
 * // Glassmorphism toolbar
 * <Box sx={layoutStyles.glassToolbar}>Toolbar content</Box>
 */

// =============================================================================
// Color Constants
// =============================================================================

/**
 * Color values referencing CSS variables
 * @example
 * import { colors } from '@/theme';
 * <Box sx={{ backgroundColor: colors.bgSecondary }}>Content</Box>
 */
export * from './colors';

// =============================================================================
// Gradient Constants
// =============================================================================

/**
 * Gradient definitions for buttons, badges, and effects
 * @example
 * import { gradients, gradientStyles } from '@/theme';
 * <Button sx={{ background: gradients.primary }}>Button</Button>
 * <Button sx={gradientStyles.primary}>Button with shadow</Button>
 */
export * from './gradients';

// =============================================================================
// Spacing Constants
// =============================================================================

/**
 * Spacing scale constants for consistent margins and padding
 * @example
 * import { spacing, spacingStyles } from '@/theme';
 * <Box sx={{ p: spacing.md }}>Content</Box>
 * <Box sx={spacingStyles.comfortable}>Content</Box>
 */
export * from './spacing';

// =============================================================================
// Shadow Constants
// =============================================================================

/**
 * Shadow definitions for depth and elevation
 * @example
 * import { shadows, shadowStyles } from '@/theme';
 * <Paper sx={{ boxShadow: shadows.md }}>Content</Paper>
 * <Paper sx={shadowStyles.card}>Card</Paper>
 */
export * from './shadows';

// =============================================================================
// Component Style Constants
// =============================================================================

/**
 * Pre-built style objects for common UI elements
 *
 * These compositions combine colors, gradients, shadows, and spacing
 * into reusable styles for buttons, badges, toolbars, cards, etc.
 *
 * @example
 * import { buttonStyles, badgeStyles, layoutStyles, formStyles } from '@/theme';
 *
 * // Buttons
 * <Button sx={buttonStyles.primary}>Primary Action</Button>
 * <Button sx={buttonStyles.ghost}>Cancel</Button>
 *
 * // Status badges
 * <Chip sx={badgeStyles.published}>Published</Chip>
 * <Chip sx={badgeStyles.draft}>Draft</Chip>
 *
 * // Layout
 * <Box sx={layoutStyles.glassToolbar}>Toolbar</Box>
 * <Paper sx={layoutStyles.cardContainer}>Card</Paper>
 *
 * // Forms
 * <TextField sx={formStyles.input} label="Name" />
 */
export * from './components';

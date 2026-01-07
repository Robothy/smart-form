/**
 * Theme Constants Module
 *
 * Centralized, type-safe style objects for consistent UI across the application.
 * All constants use MUI's SxProps<Theme> for full TypeScript support and IDE autocomplete.
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

export * from './lib/theme';

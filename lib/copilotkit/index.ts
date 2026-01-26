/**
 * CopilotKit Tools and Hooks
 *
 * This module exports all tool definitions and utility functions.
 * Tools are registered but not activated until the appropriate page is loaded.
 *
 * Importing this module will automatically register all tool definitions.
 */

// ============================================================================
// Tool Definitions (auto-register on import)
// ============================================================================

// Global navigation tools (always available)
import './definitions/navigation-tools'

// Forms list tools (for /forms page)
import './definitions/forms-list-tools'

// Form editing tools (for /forms/new and /forms/[id]/edit pages)
import './definitions/form-editing-tools'

// Form filling tools (for /forms/[id]/fill page)
import './definitions/form-filling-tools'

// Form viewing tools (for /forms/[id]/view page)
import './definitions/view-form-tools'

// Submissions viewing tools (for /forms/[id]/submissions page)
import './definitions/submissions-viewing-tools'

// ============================================================================
// Registry and Utilities
// ============================================================================

export {
  toolRegistry,
  toolState,
  activatePageTools,
  useRegisteredTools,
  useRegisteredActions,
} from './tools-registry'

export type { ToolContext, ToolDefinition, ToolGroupDefinition, ToolParameter } from './tools-registry'

// ============================================================================
// Page Tool Hooks (for pages to expose state to tools)
// ============================================================================

export {
  useFormsListPageTools,
  useFormEditingPageTools,
  useFormFillingPageTools,
  useFormViewingPageTools,
  useSubmissionsViewingPageTools,
  type UseFormsListPageToolsArgs,
  type UseFormEditingPageToolsArgs,
  type UseFormFillingPageToolsArgs,
  type UseFormViewingPageToolsArgs,
  type UseSubmissionsViewingPageToolsArgs,
} from './use-page-tools'

// ============================================================================
// Legacy Hooks (deprecated - use registry-based approach instead)
// ============================================================================

// These are kept for backward compatibility during migration
export { useNavigationTools } from './navigation-tools'

export { useFormTools, type FormToolsConfig } from './form-tools'

export { useFillFormTools, type FillFormToolsConfig } from './fill-form-tools'

export { useViewFormTools, type ViewFormToolsConfig } from './view-form-tools'

export { useSubmissionsTools, type SubmissionsToolsConfig } from './submissions-tools'

export { useFormsListTools, type FormsListToolsConfig } from './forms-list-tools'

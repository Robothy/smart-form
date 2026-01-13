/**
 * CopilotKit Tools and Hooks
 *
 * This module exports all custom hooks for registering assistant tools.
 * Each hook encapsulates tools for a specific page or feature.
 */

// Global navigation tools
export { useNavigationTools } from './navigation-tools'

// Form editing tools (for edit/new pages)
export { useFormTools, type FormToolsConfig } from './form-tools'

// Form filling tools (for fill page)
export { useFillFormTools, type FillFormToolsConfig } from './fill-form-tools'

// Form viewing tools (for view page)
export { useViewFormTools, type ViewFormToolsConfig } from './view-form-tools'

// Submissions viewing tools (for submissions page)
export { useSubmissionsTools, type SubmissionsToolsConfig } from './submissions-tools'

// Forms list tools (for forms list page)
export { useFormsListTools, type FormsListToolsConfig } from './forms-list-tools'

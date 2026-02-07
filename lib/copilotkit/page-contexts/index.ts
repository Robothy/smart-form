/**
 * Page-specific AI context hooks for CopilotKit integration
 *
 * Base utilities:
 * - useContextValues: Shared ref management hook
 * - useBaseContext: Signals tools are ready
 *
 * Each hook provides AI tools for a specific page in the application:
 * - useFormListContext: Form list page (/forms)
 * - useFormEditContext: Form edit pages (/forms/new, /forms/[id]/edit)
 * - useFormFillContext: Form fill page (/forms/[id]/fill)
 * - useFormViewContext: Form view page (/forms/[id]/view)
 * - useSubmissionsContext: Submissions page (/forms/[id]/submissions)
 * - useGlobalNavigation: Global navigation (all pages)
 */

export { useContextValues, useBaseContext } from './base-context'
export { useGlobalNavigation } from './global-navigation-context'
export { useFormListContext, type FormListConfig } from './form-list-context'
export { useFormEditContext, type FormEditContextConfig } from './form-edit-context'
export { useFormFillContext, type FormFillContextConfig } from './form-fill-context'
export { useFormViewContext, type FormViewContextConfig } from './form-view-context'
export {
  useSubmissionsContext,
  type SubmissionsContextConfig,
  type FieldDefinition,
  type Submission,
} from './submissions-context'

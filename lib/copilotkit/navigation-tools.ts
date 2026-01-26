'use client'

import { useRouter } from 'next/navigation'
import { useCopilotAction } from '@copilotkit/react-core'
import { usePageContextState } from '@/lib/contexts/page-context'

const AVAILABLE_ROUTES = [
  { path: '/forms', name: 'Forms List', description: 'View all forms' },
  { path: '/forms/new', name: 'Create New Form', description: 'Create a new form from scratch' },
] as const

/**
 * Hook that registers navigation tools for the assistant
 * Allows the assistant to navigate between pages
 */
export function useNavigationTools() {
  const router = useRouter()
  const pageContext = usePageContextState()

  // Navigate to a specific path
  useCopilotAction({
    name: 'navigateTo',
    description: `Navigate to a different page in the application.

Available paths:
- /forms - Forms list page showing all forms
- /forms/new - Create a new form page
- /forms/{id}/edit - Edit a specific draft form
- /forms/{id}/view - View a published form's details
- /forms/{id}/fill - Fill out a specific form
- /forms/{id}/submissions - View submissions for a specific form

Replace {id} with the actual form ID (obtained from page context or previous interactions).`,
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'The path to navigate to',
        required: true,
      },
      {
        name: 'reason',
        type: 'string',
        description: 'Optional explanation for the navigation',
        required: false,
      },
    ],
    handler: async ({ path, reason }) => {
      console.log(`[Navigation] Navigating to ${path}${reason ? `: ${reason}` : ''}`)
      router.push(path)
      return { success: true, path }
    },
  })

  // Go back to previous page
  useCopilotAction({
    name: 'goBack',
    description: 'Go back to the previous page',
    parameters: [],
    handler: async () => {
      console.log('[Navigation] Going back')
      router.back()
      return { success: true }
    },
  })

  // Get available routes
  useCopilotAction({
    name: 'getAvailableRoutes',
    description: 'Get a list of all available pages/routes in the application',
    parameters: [],
    handler: async () => {
      return {
        success: true,
        routes: AVAILABLE_ROUTES,
        currentPath: pageContext?.pathname,
      }
    },
  })
}

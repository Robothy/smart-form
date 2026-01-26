'use client'

import { toolRegistry, type ToolContext, type ToolGroupDefinition } from '../tools-registry'

/**
 * Navigation Tools Definition
 *
 * These tools are available globally and allow the AI assistant
 * to navigate between pages in the application.
 */

const navigationTools: ToolGroupDefinition = {
  name: 'navigation',
  description: 'Global navigation tools for moving between pages',
  tools: [
    {
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
      handler: async ({ path, reason }, context) => {
        console.log(`[Navigation] Navigating to ${path}${reason ? `: ${reason}` : ''}`)
        context.router.push(path)
        return { success: true, path }
      },
    },
    {
      name: 'goBack',
      description: 'Go back to the previous page',
      parameters: [],
      handler: async (_args, context) => {
        console.log('[Navigation] Going back')
        context.router.back()
        return { success: true }
      },
    },
    {
      name: 'getAvailableRoutes',
      description: 'Get a list of all available pages/routes in the application',
      parameters: [],
      handler: async (_args, context) => {
        const AVAILABLE_ROUTES = [
          { path: '/forms', name: 'Forms List', description: 'View all forms' },
          { path: '/forms/new', name: 'Create New Form', description: 'Create a new form from scratch' },
        ] as const

        return {
          success: true,
          routes: AVAILABLE_ROUTES,
          currentPath: context.pageContext?.pathname,
        }
      },
    },
  ],
}

// Register the navigation tools
toolRegistry.register(navigationTools)

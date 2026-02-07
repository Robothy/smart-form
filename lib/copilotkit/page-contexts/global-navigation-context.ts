'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import { TOOLS_READY_EVENT } from '../page-tools-ready'

export interface PageInfo {
  path: string
  name: string
  description: string
  category: 'forms' | 'home' | 'other'
}

const ALL_PAGES: PageInfo[] = [
  {
    path: '/',
    name: 'Home',
    description: 'Home page',
    category: 'home',
  },
  {
    path: '/forms',
    name: 'My Forms',
    description: 'View all forms with filtering options',
    category: 'forms',
  },
  {
    path: '/forms/new',
    name: 'Create Form',
    description: 'Create a new form',
    category: 'forms',
  },
]

/**
 * Global page awareness and navigation hook.
 * Provides page awareness and unified navigation functionality.
 */
export function useGlobalNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const getCurrentPage = (): PageInfo => {
    const editMatch = pathname.match(/^\/forms\/([^/]+)\/edit$/)
    if (editMatch) {
      return {
        path: pathname,
        name: 'Edit Form',
        description: 'Edit an existing draft form',
        category: 'forms',
      }
    }

    const fillMatch = pathname.match(/^\/forms\/([^/]+)\/fill$/)
    if (fillMatch) {
      return {
        path: pathname,
        name: 'Fill Form',
        description: 'Fill out a published form',
        category: 'forms',
      }
    }

    const viewMatch = pathname.match(/^\/forms\/([^/]+)\/view$/)
    if (viewMatch) {
      return {
        path: pathname,
        name: 'View Form',
        description: 'View published form details',
        category: 'forms',
      }
    }

    const submissionsMatch = pathname.match(/^\/forms\/([^/]+)\/submissions$/)
    if (submissionsMatch) {
      return {
        path: pathname,
        name: 'Form Submissions',
        description: 'View form submissions',
        category: 'forms',
      }
    }

    const shareMatch = pathname.match(/^\/forms\/share\/([^/]+)$/)
    if (shareMatch) {
      return {
        path: pathname,
        name: 'Fill Form (Share Link)',
        description: 'Fill out a form via share link',
        category: 'forms',
      }
    }

    const staticPage = ALL_PAGES.find((p) => p.path === pathname)
    if (staticPage) {
      return staticPage
    }

    return {
      path: pathname,
      name: 'Current Page',
      description: `Currently viewing ${pathname}`,
      category: 'other',
    }
  }

  const currentPage = getCurrentPage()

  useCopilotReadable({
    description: 'Current application page and available pages. This context automatically updates when navigating.',
    value: JSON.stringify({
      currentPage: {
        path: currentPage.path,
        name: currentPage.name,
        description: currentPage.description,
        category: currentPage.category,
      },
      allPages: ALL_PAGES,
      canNavigateBack: typeof window !== 'undefined' && window.history.length > 1,
    }),
  })

  useFrontendTool({
    name: 'listPages',
    description: 'List all pages that can be navigated to',
    parameters: [],
    handler: async () => {
      return {
        pages: ALL_PAGES.map((p) => ({
          path: p.path,
          name: p.name,
          description: p.description,
        })),
      }
    },
  })

  // Tool: Unified navigation tool
  useFrontendTool({
    name: 'navigate',
    description: 'Navigate to a different page. Supports multiple navigation modes through parameters. All navigation operations wait for the target page tools to be ready before returning.',
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'The path to navigate to (e.g., /forms, /forms/new)',
        required: false,
      },
      {
        name: 'formId',
        type: 'string',
        description: 'Form ID to navigate to (used with action parameter)',
        required: false,
      },
      {
        name: 'action',
        type: 'string',
        description: 'Action for the form: "view", "edit", "fill", or "submissions"',
        required: false,
      },
      {
        name: 'back',
        type: 'boolean',
        description: 'Set to true to go back to the previous page',
        required: false,
      },
    ],
    handler: async (args) => {
      const { path, formId, action, back } = args as {
        path?: string
        formId?: string
        action?: string
        back?: boolean
      }

      // Common function to navigate and wait for tools to be ready
      const navigateAndWait = (navigateFn: () => void, actionDesc: string): Promise<string> => {
        return new Promise<string>((resolve) => {
          navigateFn()

          let resolved = false
          const timeout = setTimeout(() => {
            if (resolved) return
            resolved = true
            window.removeEventListener(TOOLS_READY_EVENT, handleToolsReady)
            resolve(`${actionDesc} (timeout, tools may still be loading)`)
          }, 15000)

          const handleToolsReady = () => {
            if (resolved) return
            resolved = true
            clearTimeout(timeout)
            window.removeEventListener(TOOLS_READY_EVENT, handleToolsReady)
            resolve(`${actionDesc}, tools ready`)
          }

          window.addEventListener(TOOLS_READY_EVENT, handleToolsReady)
        })
      }

      // Navigate back (waits for tools registration)
      if (back) {
        const currentPageName = currentPage.name
        const currentPath = pathname
        if (typeof window !== 'undefined' && window.history.length > 1) {
          return navigateAndWait(() => router.back(), 'Navigating back')
        }
        return `Cannot go back - no previous page in history. Currently on "${currentPageName}" at ${currentPath}`
      }

      // Calculate target path
      let targetPath = ''
      let actionName = ''

      if (formId && action) {
        const validActions = ['view', 'edit', 'fill', 'submissions']
        if (!validActions.includes(action)) {
          throw new Error(
            `Invalid action: ${action}. Valid actions are: ${validActions.join(', ')}`
          )
        }
        targetPath = `/forms/${formId}/${action}`
        actionName = `${action} form ${formId}`
      } else if (path) {
        targetPath = path
        actionName = path
      } else {
        throw new Error(
          'Must provide one of: path, formId+action, or back=true'
        )
      }

      // Execute navigation and wait for tools registration
      return navigateAndWait(() => router.push(targetPath), `Navigated to ${actionName}`)
    },
  })
}

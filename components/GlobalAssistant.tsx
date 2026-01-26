'use client'

import { ReactNode, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CopilotSidebar } from '@copilotkit/react-ui'
import { useCopilotReadable } from '@copilotkit/react-core'
import { usePageContextState } from '@/lib/contexts/page-context'
import { activatePageTools, useRegisteredActions, toolState } from '@/lib/copilotkit/tools-registry'
import type { ToolContext } from '@/lib/copilotkit/tools-registry'

interface GlobalAssistantProps {
  children: ReactNode
  defaultOpen?: boolean
}

/**
 * Global assistant sidebar that wraps the entire application
 * Provides AI-powered assistance across all pages with shared context
 *
 * This component uses a tool registry approach to decouple tool definitions
 * from individual pages. Tools are activated based on the current page context.
 */
export function GlobalAssistant({ children, defaultOpen = false }: GlobalAssistantProps) {
  const router = useRouter()
  const pageContext = usePageContextState()

  // Activate tools based on current page type
  useEffect(() => {
    if (pageContext?.pageType) {
      activatePageTools(pageContext.pageType)
    }
  }, [pageContext?.pageType])

  // Build the tool context for registered actions
  const toolContext: ToolContext = useMemo(
    () => ({
      router,
      pageContext,
      getState: (key: string) => toolState.get(key),
      setState: (key: string, value: any) => toolState.set(key, value),
      dispatch: (action: { type: string; payload?: any }) => {
        // Handle dispatch actions from tools
        switch (action.type) {
          case 'SET_FILTER':
            // This will be handled by the page's filter setter
            toolState.set('filterAction', action.payload)
            break
          default:
            console.warn('[GlobalAssistant] Unknown action type:', action.type)
        }
      },
    }),
    [router, pageContext]
  )

  // Register all active tools using the registry
  useRegisteredActions(toolContext)

  // Share current page context with the assistant
  useCopilotReadable({
    description: 'Current application context including page location and type',
    value: JSON.stringify({
      currentPage: pageContext
        ? {
            pathname: pageContext.pathname,
            pageType: pageContext.pageType,
            params: pageContext.params,
          }
        : null,
    }),
  })

  return (
    <CopilotSidebar
      instructions={`You are a helpful assistant for FormForge, a premium form builder application.

You can assist users with:
1. **Navigation**: Navigate to different pages (forms list, create form, edit form, etc.)
2. **Form Building**: On form edit pages, help build and modify forms
3. **General Help**: Answer questions about the application

Current page context: ${pageContext ? `${pageContext.pageType} page` : 'unknown'}

Guidelines:
- Be concise and helpful
- Ask for clarification when needed
- Confirm important actions before executing
- For form building, suggest field types based on the form's purpose
- Keep field labels short and descriptive`}
      labels={{
        title: 'FormForge Assistant',
        initial: `Hi! I'm your FormForge assistant. I can help you build forms, navigate the app, and answer questions. What would you like to do?`,
      }}
      defaultOpen={defaultOpen}
      shortcut="j"
      clickOutsideToClose={false}
    >
      {children}
    </CopilotSidebar>
  )
}

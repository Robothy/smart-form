'use client'

import { ReactNode } from 'react'
import { CopilotSidebar } from '@copilotkit/react-ui'
import { useCopilotReadable } from '@copilotkit/react-core'
import { useNavigationTools } from '@/lib/copilotkit/navigation-tools'
import { usePageContextState } from '@/lib/contexts/page-context'

interface GlobalAssistantProps {
  children: ReactNode
  defaultOpen?: boolean
}

/**
 * Global assistant sidebar that wraps the entire application
 * Provides AI-powered assistance across all pages with shared context
 */
export function GlobalAssistant({ children, defaultOpen = false }: GlobalAssistantProps) {
  // Register global navigation tools
  useNavigationTools()

  // Share current page context with the assistant
  const pageContext = usePageContextState()

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
        initial: 'Hi! I\'m your FormForge assistant. I can help you build forms, navigate the app, and answer questions. What would you like to do?',
      }}
      defaultOpen={defaultOpen}
      shortcut="j"
      clickOutsideToClose={false}
    >
      {children}
    </CopilotSidebar>
  )
}

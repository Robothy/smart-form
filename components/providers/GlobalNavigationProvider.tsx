'use client'

import { useGlobalNavigation } from '@/lib/copilotkit/page-contexts'
import { Sidebar, type SidebarProps } from '@/components/common/Sidebar'
import { type ReactNode } from 'react'

/**
 * Global navigation provider that wraps the Sidebar
 * Registers global navigation tools for AI assistant
 */
export function GlobalNavigationProvider({ children, ...sidebarProps }: {
  children: ReactNode
} & SidebarProps) {
  // Register global navigation tools - available on all pages
  useGlobalNavigation()

  return <Sidebar {...sidebarProps}>{children}</Sidebar>
}

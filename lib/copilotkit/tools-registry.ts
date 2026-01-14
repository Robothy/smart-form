'use client'

import { useCopilotAction, useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import { useRouter } from 'next/navigation'
import { usePageContextState } from '@/lib/contexts/page-context'

/**
 * Tool Definition Types
 *
 * These types describe tools without tying them to React hooks.
 * Tools are pure functions that can be registered conditionally.
 */

export interface ToolDefinition<TArgs = any, TResult = any> {
  name: string
  description: string
  parameters: ToolParameter[]
  handler: (args: TArgs, context: ToolContext) => TResult | Promise<TResult>
}

export interface ToolParameter {
  name: string
  type: string
  description: string
  required: boolean
  attributes?: ToolParameter[]
}

export interface ToolContext {
  router: ReturnType<typeof useRouter>
  pageContext: ReturnType<typeof usePageContextState>
  getState: (key: string) => any
  setState: (key: string, value: any) => void
  dispatch: (action: { type: string; payload?: any }) => void
}

export interface ToolGroupDefinition {
  name: string
  description: string
  tools: ToolDefinition[]
  readableDescriptions?: Array<{
    description: string
    getValue: (context: ToolContext) => any
  }>
}

/**
 * Global Tool Registry
 *
 * Stores all tool definitions without registering them.
 * Registration happens when tools are activated for a specific page.
 */
class ToolRegistry {
  private tools = new Map<string, ToolGroupDefinition>()
  private activeTools = new Set<string>()

  register(group: ToolGroupDefinition) {
    this.tools.set(group.name, group)
  }

  activate(groupName: string) {
    if (this.tools.has(groupName)) {
      this.activeTools.add(groupName)
    }
  }

  deactivate(groupName: string) {
    this.activeTools.delete(groupName)
  }

  getActiveGroups(): ToolGroupDefinition[] {
    return Array.from(this.activeTools)
      .map((name) => this.tools.get(name))
      .filter((group): group is ToolGroupDefinition => group !== undefined)
  }

  getGroup(name: string): ToolGroupDefinition | undefined {
    return this.tools.get(name)
  }
}

export const toolRegistry = new ToolRegistry()

/**
 * React Hook to Register Tools
 *
 * This hook takes a tool context and registers all active tools using CopilotKit hooks.
 * It should be called once in the GlobalAssistant component.
 */
export function useRegisteredTools(context: ToolContext) {
  const activeGroups = toolRegistry.getActiveGroups()

  for (const group of activeGroups) {
    // Register readable descriptions first
    for (const readable of group.readableDescriptions || []) {
      useCopilotReadable({
        description: readable.description,
        value: typeof readable.getValue === 'function' ? readable.getValue(context) : readable.getValue,
      })
    }

    // Register tools
    for (const tool of group.tools) {
      useFrontendTool({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        handler: async (args) => tool.handler(args, context),
      })
    }
  }
}

/**
 * React Hook to Register CopilotAction Tools
 *
 * Similar to useRegisteredTools but uses useCopilotAction instead of useFrontendTool.
 */
export function useRegisteredActions(context: ToolContext) {
  const activeGroups = toolRegistry.getActiveGroups()

  for (const group of activeGroups) {
    // Register readable descriptions first
    for (const readable of group.readableDescriptions || []) {
      useCopilotReadable({
        description: readable.description,
        value: typeof readable.getValue === 'function' ? readable.getValue(context) : readable.getValue,
      })
    }

    // Register tools
    for (const tool of group.tools) {
      useCopilotAction({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        handler: async (args) => tool.handler(args, context),
      })
    }
  }
}

/**
 * Helper to activate tools for a specific page
 *
 * Call this function when entering a page to activate its tools.
 */
export function activatePageTools(pageType: string) {
  // Clear all active tools first
  toolRegistry.getActiveGroups().forEach((group) => {
    toolRegistry.deactivate(group.name)
  })

  // Activate tools for the current page
  switch (pageType) {
    case 'form-list':
      toolRegistry.activate('forms-list')
      break
    case 'form-new':
    case 'form-edit':
      toolRegistry.activate('form-editing')
      break
    case 'form-fill':
      toolRegistry.activate('form-filling')
      break
    case 'form-view':
      toolRegistry.activate('form-viewing')
      break
    case 'form-submissions':
      toolRegistry.activate('submissions-viewing')
      break
    default:
      // No page-specific tools, only global navigation
      break
  }

  // Always activate global navigation
  toolRegistry.activate('navigation')
}

/**
 * Global state store for tools
 *
 * Provides a way for pages to share state with tools without direct coupling.
 */
class ToolStateStore {
  private state = new Map<string, any>()

  get(key: string): any {
    return this.state.get(key)
  }

  set(key: string, value: any): void {
    this.state.set(key, value)
  }

  delete(key: string): void {
    this.state.delete(key)
  }

  clear(): void {
    this.state.clear()
  }
}

export const toolState = new ToolStateStore()

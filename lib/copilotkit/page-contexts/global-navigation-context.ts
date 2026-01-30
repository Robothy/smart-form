'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'

export interface PageInfo {
  path: string
  name: string
  description: string
  category: 'forms' | 'home' | 'other'
}

// 应用中所有可访问的页面
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
 * 全局页面感知和导航钩子
 * 提供页面感知和统一的导航功能
 */
export function useGlobalNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  // 获取当前页面信息
  const getCurrentPage = (): PageInfo => {
    // 动态路由匹配
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

  // 分享当前页面信息给 AI（自动随页面跳转更新）
  // AI 无需调用工具即可感知当前页面
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

  // 工具: 列出所有可访问的页面
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

  // 工具: 统一导航工具
  useFrontendTool({
    name: 'navigate',
    description: 'Navigate to a different page. Supports multiple navigation modes through parameters.',
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
      {
        name: 'refresh',
        type: 'boolean',
        description: 'Set to true to refresh the current page',
        required: false,
      },
    ],
    handler: async (args) => {
      const { path, formId, action, back, refresh } = args as {
        path?: string
        formId?: string
        action?: string
        back?: boolean
        refresh?: boolean
      }

      // 刷新当前页面
      if (refresh) {
        router.refresh()
        return 'Page refreshed'
      }

      // 返回上一页
      if (back) {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
          return 'Navigating back'
        }
        return 'Cannot go back - no previous page'
      }

      // 跳转到指定表单 (formId + action)
      if (formId && action) {
        const validActions = ['view', 'edit', 'fill', 'submissions']
        if (!validActions.includes(action)) {
          throw new Error(
            `Invalid action: ${action}. Valid actions are: ${validActions.join(', ')}`
          )
        }
        const targetPath = `/forms/${formId}/${action}`
        router.push(targetPath)
        return `Navigating to ${action} form ${formId}`
      }

      // 跳转到指定路径
      if (path) {
        router.push(path)
        return `Navigating to ${path}`
      }

      throw new Error(
        'Must provide one of: path, formId+action, back=true, or refresh=true'
      )
    },
  })
}

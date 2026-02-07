'use client'

import { useEffect } from 'react'

/**
 * 自定义事件名称，用于通知页面工具已注册完成
 */
export const TOOLS_READY_EVENT = 'copilot-tools-ready'

/**
 * 工具注册完成 Hook
 *
 * 在页面组件中调用此 Hook，会在页面的 useFrontendTool 执行完成后
 * 触发自定义事件，通知 navigate 工具页面已准备就绪
 *
 * 使用方式：
 * ```tsx
 * function MyPage() {
 *   // 注册工具
 *   useFrontendTool({ ... })
 *
 *   // 在工具注册后调用
 *   usePageToolsReady()
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function usePageToolsReady() {
  useEffect(() => {
    // 使用双重 requestAnimationFrame 确保在 useFrontendTool 之后执行
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(
          new CustomEvent(TOOLS_READY_EVENT, {
            detail: { timestamp: Date.now() },
          })
        )
      })
    })
  }, [])
}

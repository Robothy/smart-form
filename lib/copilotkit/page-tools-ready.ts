'use client'

import { useEffect } from 'react'

export const TOOLS_READY_EVENT = 'copilot-tools-ready'

/**
 * Hook to signal that page tools are ready.
 * Call this in a page component after registering tools with useFrontendTool.
 * Emits a custom event to notify the navigate tool that the page is ready.
 */
export function usePageToolsReady() {
  useEffect(() => {
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

'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePageToolsReady } from '../page-tools-ready'
import { TOOLS_READY_EVENT } from '../page-tools-ready'

/**
 * Creates a ref that stays in sync with the provided value using useEffect.
 * This is a common pattern across all page contexts to avoid closure staleness.
 *
 * @param values - The value to keep in sync with the ref
 * @returns A ref containing the current value
 */
export function useContextValues<T>(values: T) {
  const ref = useRef(values)
  useEffect(() => {
    ref.current = values
  }, [values])
  return ref
}

/**
 * Base context hook that should be called at the end of all page context hooks.
 * This signals that all tools for the page have been registered.
 *
 * This replaces the direct `usePageToolsReady()` call that was repeated in every context.
 */
export function useBaseContext() {
  usePageToolsReady()
}

/**
 * Navigate to a path and wait for the target page's tools to be ready.
 * This should be used by AI tools that trigger page navigation.
 *
 * @param router - Next.js router instance
 * @param path - Target path to navigate to
 * @param actionDesc - Description of the action for the return message
 * @param timeout - Timeout in milliseconds (default 15000)
 * @returns Promise that resolves when tools are ready or timeout occurs
 */
export async function navigateAndWait(
  router: ReturnType<typeof useRouter>,
  path: string,
  actionDesc: string,
  timeout = 15000
): Promise<string> {
  return new Promise<string>((resolve) => {
    router.push(path)

    let resolved = false
    const timeoutId = setTimeout(() => {
      if (resolved) return
      resolved = true
      window.removeEventListener(TOOLS_READY_EVENT, handleToolsReady)
      resolve(`${actionDesc} (timeout, tools may still be loading)`)
    }, timeout)

    const handleToolsReady = () => {
      if (resolved) return
      resolved = true
      clearTimeout(timeoutId)
      window.removeEventListener(TOOLS_READY_EVENT, handleToolsReady)
      resolve(`${actionDesc}, tools ready`)
    }

    window.addEventListener(TOOLS_READY_EVENT, handleToolsReady)
  })
}

/**
 * Wait for page tools to be ready after a state change (e.g., save triggering re-render).
 * This should be used by AI tools that cause new tools to be registered without navigation.
 *
 * @param actionDesc - Description of the action for the return message
 * @param timeout - Timeout in milliseconds (default 5000)
 * @returns Promise that resolves when tools are ready or timeout occurs
 */
export function waitForToolsReady(actionDesc: string, timeout = 5000): Promise<string> {
  return new Promise<string>((resolve) => {
    let resolved = false
    const timeoutId = setTimeout(() => {
      if (resolved) return
      resolved = true
      window.removeEventListener(TOOLS_READY_EVENT, handleToolsReady)
      resolve(`${actionDesc} (timeout, tools may still be loading)`)
    }, timeout)

    const handleToolsReady = () => {
      if (resolved) return
      resolved = true
      clearTimeout(timeoutId)
      window.removeEventListener(TOOLS_READY_EVENT, handleToolsReady)
      resolve(`${actionDesc}, tools ready`)
    }

    window.addEventListener(TOOLS_READY_EVENT, handleToolsReady)
  })
}

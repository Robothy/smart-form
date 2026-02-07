'use client'

import { useRef, useEffect } from 'react'
import { usePageToolsReady } from '../page-tools-ready'

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

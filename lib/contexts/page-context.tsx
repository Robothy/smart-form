'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export type PageType =
  | 'form-list'
  | 'form-new'
  | 'form-edit'
  | 'form-fill'
  | 'form-view'
  | 'form-submissions'
  | 'other'

export interface PageContext {
  pathname: string
  pageType: PageType
  params?: Record<string, string>
}

interface PageContextValue {
  context: PageContext | null
  setContext: (context: PageContext) => void
}

const PageContextProviderContext = createContext<PageContextValue | undefined>(undefined)

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [context, setContextState] = useState<PageContext | null>(null)
  const pathname = usePathname()

  // Auto-detect page type from pathname
  useEffect(() => {
    let pageType: PageType = 'other'
    const params: Record<string, string> = {}

    if (pathname === '/forms') {
      pageType = 'form-list'
    } else if (pathname === '/forms/new') {
      pageType = 'form-new'
    } else if (pathname?.match(/^\/forms\/[^/]+\/edit$/)) {
      pageType = 'form-edit'
      const id = pathname.split('/')[2]
      params.id = id
    } else if (pathname?.match(/^\/forms\/[^/]+\/fill$/)) {
      pageType = 'form-fill'
      const id = pathname.split('/')[2]
      params.id = id
    } else if (pathname?.match(/^\/forms\/[^/]+\/view$/)) {
      pageType = 'form-view'
      const id = pathname.split('/')[2]
      params.id = id
    } else if (pathname?.match(/^\/forms\/[^/]+\/submissions$/)) {
      pageType = 'form-submissions'
      const id = pathname.split('/')[2]
      params.id = id
    }

    setContextState({ pathname: pathname || '', pageType, params })
  }, [pathname])

  const setContext = (newContext: PageContext) => {
    setContextState(newContext)
  }

  return (
    <PageContextProviderContext.Provider value={{ context, setContext }}>
      {children}
    </PageContextProviderContext.Provider>
  )
}

export function usePageContextState() {
  const value = useContext(PageContextProviderContext)
  if (!value) {
    throw new Error('usePageContextState must be used within PageContextProvider')
  }
  return value.context
}

export function useSetPageContext() {
  const value = useContext(PageContextProviderContext)
  if (!value) {
    throw new Error('useSetPageContext must be used within PageContextProvider')
  }
  return value.setContext
}

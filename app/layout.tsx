import type { Metadata } from 'next'
import './globals.css'
import '@copilotkit/react-ui/styles.css'
import { CopilotKit } from '@copilotkit/react-core'
import { NavBar } from '@/components/common/NavBar'
import { GlobalNavigationProvider } from '@/components/providers'

export const metadata: Metadata = {
  title: 'FormForge - Premium Form Builder',
  description: 'Create, publish, and share beautiful forms with ease',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="formBuilder">
          <GlobalNavigationProvider
            instructions="You are FormForge Assistant, an AI helper for building and managing forms. You have access to global navigation tools and page-specific tools depending on the current page."
            labels={{
              title: 'FormForge Assistant',
              initial: 'Hi! I can help you with forms. Ask me about navigation or page-specific actions.',
            }}
            defaultOpen={false}
          >
            <NavBar />
            <main style={{ marginTop: 0 }}>
              {children}
            </main>
          </GlobalNavigationProvider>
        </CopilotKit>
      </body>
    </html>
  )
}

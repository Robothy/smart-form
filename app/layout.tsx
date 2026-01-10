import type { Metadata } from 'next'
import './globals.css'
import '@copilotkit/react-ui/styles.css'
import { CopilotKit } from '@copilotkit/react-core'
import { NavBar } from '@/components/common/NavBar'

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
          <NavBar />
          <main style={{ marginTop: 0 }}>
            {children}
          </main>
        </CopilotKit>
      </body>
    </html>
  )
}

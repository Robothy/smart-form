import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simple Form - Form Builder',
  description: 'Create, publish, and share forms',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

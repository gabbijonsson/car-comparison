import type { ReactNode } from 'react'
import { AppHeader } from './AppHeader'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  )
}

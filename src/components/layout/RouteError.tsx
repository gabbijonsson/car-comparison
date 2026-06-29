import type { ErrorComponentProps } from '@tanstack/react-router'
import { AppShell } from '~/components/layout/AppShell'
import { ErrorPageContent } from '~/components/layout/ErrorPageContent'

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <AppShell>
      <ErrorPageContent
        showRetry
        onRetry={() => {
          reset()
        }}
        description={error.message || undefined}
      />
    </AppShell>
  )
}

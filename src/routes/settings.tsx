import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '~/components/layout/AppShell'
import { sv } from '~/lib/i18n/sv'

export const Route = createFileRoute('/settings')({
  component: SettingsPlaceholder,
})

function SettingsPlaceholder() {
  return (
    <AppShell>
      <h1 className="font-heading text-3xl font-semibold">{sv.nav.settings}</h1>
      <p className="mt-2 text-muted-foreground">Kommer i Epic 4.</p>
    </AppShell>
  )
}

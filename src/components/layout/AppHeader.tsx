import { sv } from '~/lib/i18n/sv'
import { AppNav } from './AppNav'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-lg font-semibold tracking-tight">{sv.app.name}</p>
          <p className="text-sm text-muted-foreground">{sv.app.tagline}</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <AppNav />
          <div
            className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"
            title={sv.auth.gatePlaceholder}
          >
            {sv.nav.login}
          </div>
        </div>
      </div>
    </header>
  )
}

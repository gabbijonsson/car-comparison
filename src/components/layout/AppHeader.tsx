import { convexQuery } from '@convex-dev/react-query'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from '@tanstack/react-query'
import { UserAvatar } from '~/components/auth/UserAvatar'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import { AppNav } from './AppNav'

export function AppHeader() {
  const { signOut } = useAuthActions()
  const { data: currentUser } = useQuery(convexQuery(api.users.current, {}))

  const displayName = currentUser?.name ?? currentUser?.email ?? sv.common.loading

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-lg font-semibold tracking-tight">{sv.app.name}</p>
          <p className="text-sm text-muted-foreground">{sv.app.tagline}</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <AppNav />
          <div className="flex items-center gap-3">
            <UserAvatar
              name={currentUser?.name}
              email={currentUser?.email}
              image={currentUser?.image}
            />
            <span className="text-sm font-medium">{displayName}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void signOut()
              }}
            >
              {sv.nav.logout}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

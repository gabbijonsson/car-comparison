import type { ReactNode } from 'react'
import { useConvexAuth } from '@convex-dev/auth/react'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ProfileCompletionDrawer } from '~/components/auth/ProfileCompletionDrawer'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'

type AuthenticatedGateProps = {
  children: ReactNode
  onUnauthenticated: () => void
}

export function AuthenticatedGate({ children, onUnauthenticated }: AuthenticatedGateProps) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const { data: currentUser } = useQuery({
    ...convexQuery(api.users.current, {}),
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onUnauthenticated()
    }
  }, [isAuthenticated, isLoading, onUnauthenticated])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        {sv.common.loading}
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const needsProfile = currentUser !== undefined && currentUser !== null && !currentUser.name

  return (
    <>
      {children}
      <ProfileCompletionDrawer open={needsProfile} />
    </>
  )
}

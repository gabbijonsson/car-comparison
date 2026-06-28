import { useConvexAuth } from '@convex-dev/auth/react'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { useMutation } from 'convex/react'
import type { ReactNode } from 'react'
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
  const ensureDefaults = useMutation(api.settings.ensureDefaults)
  const { data: currentUser } = useQuery({
    ...convexQuery(api.users.current, {}),
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onUnauthenticated()
    }
  }, [isAuthenticated, isLoading, onUnauthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      void ensureDefaults({})
    }
  }, [ensureDefaults, isAuthenticated])

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

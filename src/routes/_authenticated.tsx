import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback } from 'react'
import { AuthenticatedGate } from '~/components/auth/AuthenticatedGate'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const onUnauthenticated = useCallback(() => {
    void navigate({
      to: '/login',
      search: pathname === '/' ? {} : { redirect: pathname },
    })
  }, [navigate, pathname])

  return (
    <AuthenticatedGate onUnauthenticated={onUnauthenticated}>
      <Outlet />
    </AuthenticatedGate>
  )
}

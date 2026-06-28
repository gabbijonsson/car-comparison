import { useConvexAuth } from '@convex-dev/auth/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LoginForm } from '~/components/auth/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { sv } from '~/lib/i18n/sv'

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const navigate = useNavigate()
  const { redirect: redirectTo } = Route.useSearch()

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }
    void navigate({ to: redirectTo ?? '/' })
  }, [isAuthenticated, isLoading, navigate, redirectTo])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        {sv.common.loading}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{sv.auth.loginTitle}</CardTitle>
          <CardDescription>{sv.auth.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            onSuccess={() => {
              void navigate({ to: redirectTo ?? '/' })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

import { useAuthActions } from '@convex-dev/auth/react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { authErrorMessage } from '~/lib/auth/errors'
import { sv } from '~/lib/i18n/sv'

type LoginFormProps = {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn } = useAuthActions()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)
        setSubmitting(true)
        const formData = new FormData(event.currentTarget)
        formData.set('flow', 'signIn')
        void signIn('password', formData)
          .then(() => {
            onSuccess()
          })
          .catch((cause: unknown) => {
            setError(authErrorMessage(cause))
          })
          .finally(() => {
            setSubmitting(false)
          })
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="login-email">{sv.auth.emailLabel}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={submitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">{sv.auth.passwordLabel}</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={submitting}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? sv.common.loading : sv.nav.login}
      </Button>
    </form>
  )
}

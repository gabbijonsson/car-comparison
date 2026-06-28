import { useMutation } from 'convex/react'
import { useState } from 'react'
import { FormDrawer } from '~/components/layout/FormDrawer'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'

type ProfileCompletionDrawerProps = {
  open: boolean
}

export function ProfileCompletionDrawer({ open }: ProfileCompletionDrawerProps) {
  const updateProfile = useMutation(api.users.updateProfile)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <FormDrawer
      open={open}
      onOpenChange={() => undefined}
      title={sv.auth.profileTitle}
      description={sv.auth.profileDescription}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setError(null)
          setSubmitting(true)
          void updateProfile({ name })
            .catch(() => {
              setError(sv.auth.profileError)
            })
            .finally(() => {
              setSubmitting(false)
            })
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="profile-name">{sv.auth.displayNameLabel}</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            disabled={submitting}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={submitting || name.trim().length === 0}>
          {submitting ? sv.common.loading : sv.auth.profileSave}
        </Button>
      </form>
    </FormDrawer>
  )
}

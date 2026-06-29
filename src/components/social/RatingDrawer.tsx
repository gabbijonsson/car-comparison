import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { FormDrawer } from '~/components/layout/FormDrawer'
import { RatingControl } from '~/components/social/RatingControl'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type RatingDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectId: Id<'prospects'>
  currentScore: number | null
}

export function RatingDrawer({ open, onOpenChange, prospectId, currentScore }: RatingDrawerProps) {
  const setRating = useMutation(api.social.setRating)
  const [selected, setSelected] = useState(currentScore ?? 0)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSelected(currentScore ?? 0)
      setError(null)
    }
  }, [open, currentScore])

  async function handleSave() {
    if (selected < 1 || selected > 5) {
      setError(sv.detail.noRating)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await setRating({ prospectId, score: selected })
      onOpenChange(false)
    } catch {
      setError(sv.common.saveError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={sv.detail.rateTitle}
      description={sv.detail.rateDescription}
    >
      <div className="grid gap-6">
        <RatingControl value={selected} onChange={setSelected} disabled={saving} />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {sv.home.cancel}
          </Button>
          <Button disabled={saving || selected < 1} onClick={() => void handleSave()}>
            {sv.common.save}
          </Button>
        </div>
      </div>
    </FormDrawer>
  )
}

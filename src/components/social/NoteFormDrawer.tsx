import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { FormDrawer } from '~/components/layout/FormDrawer'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

type NoteFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectId: Id<'prospects'>
  note?: Pick<Doc<'notes'>, '_id' | 'text'>
}

export function NoteFormDrawer({ open, onOpenChange, prospectId, note }: NoteFormDrawerProps) {
  const createNote = useMutation(api.social.createNote)
  const updateNote = useMutation(api.social.updateNote)
  const [text, setText] = useState(note?.text ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const isEditing = note !== undefined

  useEffect(() => {
    if (open) {
      setText(note?.text ?? '')
      setError(null)
    }
  }, [open, note])

  async function handleSave() {
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      setError(sv.detail.notePlaceholder)
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (isEditing) {
        await updateNote({ id: note._id, text: trimmed })
      } else {
        await createNote({ prospectId, text: trimmed })
      }
      setText('')
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
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setText(note?.text ?? '')
          setError(null)
        }
        onOpenChange(nextOpen)
      }}
      title={isEditing ? sv.detail.editNote : sv.detail.addNote}
    >
      <div className="grid gap-4">
        <textarea
          className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={sv.detail.notePlaceholder}
        />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {sv.home.cancel}
          </Button>
          <Button disabled={saving} onClick={() => void handleSave()}>
            {sv.common.save}
          </Button>
        </div>
      </div>
    </FormDrawer>
  )
}

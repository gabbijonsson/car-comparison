import { Pencil, Trash2 } from 'lucide-react'
import { EmptyState } from '~/components/layout/EmptyState'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'
import type { Doc } from '../../../convex/_generated/dataModel'

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type NoteRow = Doc<'notes'> & {
  authorName: string
  isOwn: boolean
}

type NotesListProps = {
  notes: NoteRow[]
  onEdit: (note: NoteRow) => void
  onDelete: (note: NoteRow) => void
}

export function NotesList({ notes, onEdit, onDelete }: NotesListProps) {
  if (notes.length === 0) {
    return <EmptyState title={sv.detail.noNotes} className="border-none py-6" />
  }

  return (
    <ul className="grid gap-3">
      {notes.map((note) => (
        <li key={note._id} className="rounded-lg border border-border px-4 py-3">
          <p className="whitespace-pre-wrap text-sm">{note.text}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {sv.detail.byUser.replace('{user}', note.authorName)}
              {' · '}
              {dateFormatter.format(note.createdAt)}
              {note.updatedAt !== undefined
                ? ` · ${sv.detail.editedAt.replace('{date}', dateFormatter.format(note.updatedAt))}`
                : null}
            </span>
            {note.isOwn ? (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={sv.common.edit}
                  onClick={() => onEdit(note)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={sv.common.delete}
                  onClick={() => onDelete(note)}
                >
                  <Trash2 />
                </Button>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

import { useMutation } from 'convex/react'
import { Archive, Ban, Bell, MessageSquarePlus, Pencil, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type ProspectActionBarProps = {
  prospectId: Id<'prospects'>
  prospectStatus: 'active' | 'archived'
  ratings: Array<{ userName: string; score: number }>
  vetoes: Array<{ userName: string }>
  myVeto: boolean
  myReminder: boolean
  onEdit: () => void
  onRate: () => void
  onAddNote: () => void
  onArchive: () => void
}

function AttributionPopover({
  label,
  items,
  children,
}: {
  label: string
  items: string[]
  children: ReactNode
}) {
  if (items.length === 0) {
    return children
  }

  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent align="start">
        <p className="mb-2 font-medium">{label}</p>
        <ul className="grid gap-1 text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export function ProspectActionBar({
  prospectId,
  prospectStatus,
  ratings,
  vetoes,
  myVeto,
  myReminder,
  onEdit,
  onRate,
  onAddNote,
  onArchive,
}: ProspectActionBarProps) {
  const toggleVeto = useMutation(api.social.toggleVeto)
  const toggleReminder = useMutation(api.social.toggleReminder)

  const ratingLines = ratings.map((rating) => `${rating.userName}: ${rating.score}/5`)
  const vetoLines = vetoes.map((veto) => veto.userName)

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onEdit}>
        <Pencil data-icon="inline-start" />
        {sv.common.edit}
      </Button>

      <AttributionPopover label={sv.detail.attributionRatings} items={ratingLines}>
        <Button variant="outline" onClick={onRate}>
          <Star data-icon="inline-start" />
          {sv.detail.rate}
        </Button>
      </AttributionPopover>

      <AttributionPopover label={sv.detail.attributionVetoes} items={vetoLines}>
        <Button
          variant={myVeto ? 'destructive' : 'outline'}
          onClick={() => void toggleVeto({ prospectId })}
        >
          <Ban data-icon="inline-start" />
          {myVeto ? sv.detail.vetoActive : sv.detail.veto}
        </Button>
      </AttributionPopover>

      <Button
        variant={myReminder ? 'secondary' : 'outline'}
        onClick={() => void toggleReminder({ prospectId })}
      >
        <Bell data-icon="inline-start" />
        {myReminder ? sv.detail.reminderActive : sv.detail.reminder}
      </Button>

      <Button variant="outline" onClick={onAddNote}>
        <MessageSquarePlus data-icon="inline-start" />
        {sv.detail.addNote}
      </Button>

      {prospectStatus === 'active' ? (
        <Button variant="outline" onClick={onArchive}>
          <Archive data-icon="inline-start" />
          {sv.prospects.archive}
        </Button>
      ) : null}
    </div>
  )
}

import { Archive, MessageSquarePlus, Pencil, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { ReminderToggle } from '~/components/social/ReminderToggle'
import { VetoButton } from '~/components/social/VetoButton'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { sv } from '~/lib/i18n/sv'
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
  const ratingLines = ratings.map((rating) => `${rating.userName}: ${rating.score}/5`)
  const vetoNames = vetoes.map((veto) => veto.userName)

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

      <VetoButton prospectId={prospectId} active={myVeto} vetoNames={vetoNames} />

      <ReminderToggle prospectId={prospectId} active={myReminder} />

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

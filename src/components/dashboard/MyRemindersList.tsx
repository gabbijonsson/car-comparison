import { useMutation } from 'convex/react'
import { BellOff } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type ReminderRow = {
  _id: Id<'reminders'>
  prospectId: Id<'prospects'>
  prospectTitle: string | null
  prospectStatus: string | null
  createdAt: number
}

type MyRemindersListProps = {
  reminders: ReminderRow[]
}

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'medium',
})

export function MyRemindersList({ reminders }: MyRemindersListProps) {
  const toggleReminder = useMutation(api.social.toggleReminder)
  const active = reminders.filter(
    (reminder) => reminder.prospectStatus === 'active' && reminder.prospectTitle !== null,
  )

  if (active.length === 0) {
    return <p className="text-sm text-muted-foreground">{sv.dashboard.remindersEmpty}</p>
  }

  return (
    <ul className="grid gap-2">
      {active.map((reminder) => (
        <li
          key={reminder._id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium">{reminder.prospectTitle}</p>
            <p className="text-xs text-muted-foreground">
              {sv.dashboard.reminderSince.replace(
                '{date}',
                dateFormatter.format(reminder.createdAt),
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={sv.dashboard.removeReminder}
            onClick={() => void toggleReminder({ prospectId: reminder.prospectId })}
          >
            <BellOff />
          </Button>
        </li>
      ))}
    </ul>
  )
}

import { useMutation } from 'convex/react'
import { Bell } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type ReminderToggleProps = {
  prospectId: Id<'prospects'>
  active: boolean
  size?: 'default' | 'icon-sm'
}

export function ReminderToggle({ prospectId, active, size = 'default' }: ReminderToggleProps) {
  const toggleReminder = useMutation(api.social.toggleReminder)

  if (size === 'icon-sm') {
    return (
      <Button
        variant={active ? 'secondary' : 'ghost'}
        size="icon-sm"
        aria-label={active ? sv.detail.reminderActive : sv.detail.reminderToggle}
        onClick={() => void toggleReminder({ prospectId })}
      >
        <Bell />
      </Button>
    )
  }

  return (
    <Button
      variant={active ? 'secondary' : 'outline'}
      aria-label={sv.detail.reminderToggle}
      onClick={() => void toggleReminder({ prospectId })}
    >
      <Bell data-icon="inline-start" />
      {active ? sv.detail.reminderActive : sv.detail.reminder}
    </Button>
  )
}

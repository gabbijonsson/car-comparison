import { useQuery } from 'convex/react'
import { formatActivityMessage } from '~/lib/activity/formatMessage'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type DashboardActivityFeedProps = {
  limit?: number
}

export function DashboardActivityFeed({ limit = 10 }: DashboardActivityFeedProps) {
  const events = useQuery(api.activity.listRecent, { limit })

  if (events === undefined) {
    return <p className="text-sm text-muted-foreground">{sv.common.loading}</p>
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{sv.dashboard.activityEmpty}</p>
  }

  return (
    <ul className="grid gap-2">
      {events.map((event) => (
        <li key={event._id} className="rounded-lg border border-border px-3 py-2 text-sm">
          <p>{formatActivityMessage(event)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dateFormatter.format(event.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  )
}

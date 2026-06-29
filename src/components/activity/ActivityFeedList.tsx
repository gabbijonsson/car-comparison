import { useQuery } from 'convex/react'
import { EmptyState } from '~/components/layout/EmptyState'
import { ListSkeleton } from '~/components/layout/LoadingSkeletons'
import { sv } from '~/lib/i18n/sv'
import type { ActivityEventType } from '~/lib/validation/enums'
import { api } from '../../../convex/_generated/api'

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type ActivityFeedListProps = {
  limit?: number
  type?: ActivityEventType
  emptyMessage?: string
}

export function ActivityFeedList({
  limit = 10,
  type,
  emptyMessage = sv.dashboard.activityEmpty,
}: ActivityFeedListProps) {
  const events = useQuery(api.activity.listRecent, { limit, type })

  if (events === undefined) {
    return <ListSkeleton items={limit > 10 ? 8 : limit} />
  }

  if (events.length === 0) {
    return <EmptyState title={emptyMessage} className="border-none py-6" />
  }

  return (
    <ul className="grid gap-2">
      {events.map((event) => (
        <li key={event._id} className="rounded-lg border border-border px-3 py-2 text-sm">
          <p>{event.displayMessage}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dateFormatter.format(event.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  )
}

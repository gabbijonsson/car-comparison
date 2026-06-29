import { useQuery } from 'convex/react'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type ActivityFeedProps = {
  type?: 'settings' | 'equipment'
  limit?: number
  title?: string
  emptyMessage?: string
}

export function ActivityFeed({
  type,
  limit = 5,
  title = sv.settings.activityTitle,
  emptyMessage = sv.settings.activityEmpty,
}: ActivityFeedProps) {
  const events = useQuery(api.activity.listRecent, { limit: limit * 3 })
  const filtered =
    events?.filter((event) => (type === undefined ? true : event.type === type)).slice(0, limit) ??
    []

  if (events === undefined) {
    return <p className="text-sm text-muted-foreground">{sv.common.loading}</p>
  }

  return (
    <section className="grid gap-3">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-2">
          {filtered.map((event) => (
            <li key={event._id} className="rounded-lg border border-border px-3 py-2 text-sm">
              <p>{event.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dateFormatter.format(event.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

import { sv } from '~/lib/i18n/sv'
import { ActivityFeedList } from './ActivityFeedList'

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
  return (
    <section className="grid gap-3">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <ActivityFeedList limit={limit} type={type} emptyMessage={emptyMessage} />
    </section>
  )
}

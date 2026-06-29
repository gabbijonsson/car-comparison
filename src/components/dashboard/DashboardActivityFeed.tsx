import { ActivityFeedList } from '~/components/activity/ActivityFeedList'

type DashboardActivityFeedProps = {
  limit?: number
}

export function DashboardActivityFeed({ limit = 10 }: DashboardActivityFeedProps) {
  return <ActivityFeedList limit={limit} />
}

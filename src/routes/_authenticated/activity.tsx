import { createFileRoute, Link } from '@tanstack/react-router'
import { ActivityFeedList } from '~/components/activity/ActivityFeedList'
import { AppShell } from '~/components/layout/AppShell'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'

export const Route = createFileRoute('/_authenticated/activity')({
  component: ActivityPage,
})

function ActivityPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {sv.activity.title}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{sv.activity.description}</p>
          </div>
          <Button variant="outline" render={<Link to="/" />}>
            {sv.activity.backToDashboard}
          </Button>
        </div>

        <ActivityFeedList limit={50} emptyMessage={sv.activity.empty} />
      </div>
    </AppShell>
  )
}

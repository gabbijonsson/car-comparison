import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Settings } from 'lucide-react'
import { useMemo, useState } from 'react'
import { type CostChartSeries, CostLineChart } from '~/components/costs/CostLineChart'
import { DashboardActivityFeed } from '~/components/dashboard/DashboardActivityFeed'
import { MyRemindersList } from '~/components/dashboard/MyRemindersList'
import { TopRatedList } from '~/components/dashboard/TopRatedList'
import { EmptyState } from '~/components/layout/EmptyState'
import { AppShell } from '~/components/layout/AppShell'
import { ConfirmDialog } from '~/components/layout/ConfirmDialog'
import { DashboardSkeleton } from '~/components/layout/LoadingSkeletons'
import { ProspectFormDrawer } from '~/components/prospects/ProspectFormDrawer'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { buildMonthlySchedule } from '~/lib/cost-engine'
import { sv } from '~/lib/i18n/sv'
import { toast } from '~/lib/toast'
import {
  toCompletionItems,
  toCostEngineSettings,
  toProspectCostInput,
} from '~/lib/prospect/costMapping'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<Id<'prospects'> | null>(null)

  const activeWithItems = useQuery(api.prospects.listActiveWithPurchaseItems)
  const settings = useQuery(api.settings.get)
  const ratings = useQuery(api.social.ratingsAggregate)
  const reminders = useQuery(api.social.listMyReminders)
  const archiveProspect = useMutation(api.prospects.archive)

  const vetoByProspect = useMemo(() => {
    const map = new Map<Id<'prospects'>, boolean>()
    for (const row of ratings ?? []) {
      map.set(row.prospectId, row.hasVeto)
    }
    return map
  }, [ratings])

  const chartSeries = useMemo((): CostChartSeries[] => {
    if (activeWithItems === undefined || settings === undefined || settings === null) {
      return []
    }

    const engineSettings = toCostEngineSettings({
      annualKm: settings.annualKm,
      petrolPriceSekPerLiter: settings.petrolPriceSekPerLiter,
      dieselPriceSekPerLiter: settings.dieselPriceSekPerLiter,
      kwhPriceSekPerKwh: settings.kwhPriceSekPerKwh,
      hybridFuelPercent: settings.hybridFuelPercent,
      hybridLitersPerMil: settings.hybridLitersPerMil,
      hybridKwhPerMil: settings.hybridKwhPerMil,
      ownershipMonths: settings.ownershipMonths,
    })

    return activeWithItems.map(({ prospect, purchaseItems }) => {
      const projection = buildMonthlySchedule(
        toProspectCostInput(prospect),
        engineSettings,
        toCompletionItems(purchaseItems),
      )

      return {
        prospectId: prospect._id,
        key: prospect._id.replace(/[^a-zA-Z0-9]/g, ''),
        label: prospect.title,
        hasVeto: vetoByProspect.get(prospect._id) ?? false,
        cumulativeByMonth: projection.months.map((row) => row.cumulativeSek),
      }
    })
  }, [activeWithItems, settings, vetoByProspect])

  const loading =
    activeWithItems === undefined ||
    settings === undefined ||
    ratings === undefined ||
    reminders === undefined

  const settingsMissing = settings === null

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{sv.home.title}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{sv.dashboard.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setDrawerOpen(true)}>{sv.dashboard.addProspect}</Button>
            <Button variant="outline" render={<Link to="/settings" />}>
              <Settings data-icon="inline-start" />
              {sv.dashboard.openSettings}
            </Button>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{sv.dashboard.chartTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {settingsMissing ? (
                  <EmptyState title={sv.settings.requiredForCosts} className="border-none py-8" />
                ) : activeWithItems.length === 0 ? (
                  <EmptyState title={sv.dashboard.prospectsEmpty} className="border-none py-8" />
                ) : (
                  <CostLineChart
                    series={chartSeries}
                    onArchive={(prospectId) => setArchiveTarget(prospectId)}
                  />
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{sv.dashboard.topRatedTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopRatedList rows={ratings} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{sv.dashboard.remindersTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MyRemindersList reminders={reminders} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle>{sv.dashboard.activityTitle}</CardTitle>
                <Button variant="link" className="h-auto p-0" render={<Link to="/activity" />}>
                  {sv.dashboard.viewAllActivity}
                </Button>
              </CardHeader>
              <CardContent>
                <DashboardActivityFeed limit={10} />
              </CardContent>
            </Card>
          </>
        )}

        <ProspectFormDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

        <ConfirmDialog
          open={archiveTarget !== null}
          onOpenChange={(open) => {
            if (!open) {
              setArchiveTarget(null)
            }
          }}
          title={sv.dashboard.archiveTitle}
          description={sv.dashboard.archiveDescription}
          onConfirm={async () => {
            if (archiveTarget === null) {
              return
            }
            try {
              await archiveProspect({ id: archiveTarget })
              setArchiveTarget(null)
            } catch {
              toast.error()
            }
          }}
        />
      </div>
    </AppShell>
  )
}

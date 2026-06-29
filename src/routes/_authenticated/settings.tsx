import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ActivityFeed } from '~/components/activity/ActivityFeed'
import { AppShell } from '~/components/layout/AppShell'
import { SettingsSkeleton } from '~/components/layout/LoadingSkeletons'
import { GlobalSettingsForm } from '~/components/settings/GlobalSettingsForm'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const settings = useQuery(api.settings.get)
  const fieldDefaults = useQuery(api.settings.getFieldDefaults)

  const loading = settings === undefined || (settings === null && fieldDefaults === undefined)

  return (
    <AppShell>
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="font-heading text-3xl font-semibold">{sv.settings.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{sv.settings.description}</p>
        </div>

        {loading ? (
          <SettingsSkeleton />
        ) : settings === null && fieldDefaults !== undefined ? (
          <>
            <p className="max-w-2xl text-sm text-muted-foreground">{sv.settings.setupHint}</p>
            <GlobalSettingsForm initialValues={fieldDefaults} />
          </>
        ) : settings !== null && settings !== undefined ? (
          <GlobalSettingsForm
            key={settings.updatedAt}
            initialValues={{
              annualKm: settings.annualKm,
              petrolPriceSekPerLiter: settings.petrolPriceSekPerLiter,
              dieselPriceSekPerLiter: settings.dieselPriceSekPerLiter,
              kwhPriceSekPerKwh: settings.kwhPriceSekPerKwh,
              hybridFuelPercent: settings.hybridFuelPercent,
              hybridLitersPerMil: settings.hybridLitersPerMil,
              hybridKwhPerMil: settings.hybridKwhPerMil,
              ownershipMonths: settings.ownershipMonths,
            }}
          />
        ) : null}

        <ActivityFeed type="settings" />
      </div>
    </AppShell>
  )
}

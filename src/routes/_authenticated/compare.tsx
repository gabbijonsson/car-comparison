import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo } from 'react'
import { ComparisonCards } from '~/components/comparison/ComparisonCards'
import { ComparisonTable } from '~/components/comparison/ComparisonTable'
import { ProspectPicker } from '~/components/comparison/ProspectPicker'
import { AppShell } from '~/components/layout/AppShell'
import { EmptyState } from '~/components/layout/EmptyState'
import { CompareSkeleton } from '~/components/layout/LoadingSkeletons'
import {
  buildComparisonProspects,
  buildComparisonRows,
} from '~/lib/comparison/buildComparisonProspects'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type CompareSearch = {
  ids?: string
}

function parseIds(raw: string | undefined): Id<'prospects'>[] {
  if (raw === undefined || raw.trim().length === 0) {
    return []
  }
  return raw.split(',').filter(Boolean) as Id<'prospects'>[]
}

function serializeIds(ids: Id<'prospects'>[]): string | undefined {
  if (ids.length === 0) {
    return undefined
  }
  return ids.join(',')
}

export const Route = createFileRoute('/_authenticated/compare')({
  validateSearch: (search: Record<string, unknown>): CompareSearch => ({
    ids: typeof search.ids === 'string' ? search.ids : undefined,
  }),
  component: ComparePage,
})

function ComparePage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { ids: idsParam } = Route.useSearch()

  const comparisonRows = useQuery(api.prospects.listActiveForComparison)
  const equipmentCatalog = useQuery(api.equipment.list, {})
  const settings = useQuery(api.settings.get)
  const ensureDefaults = useMutation(api.settings.ensureDefaults)

  useEffect(() => {
    if (settings === null) {
      void ensureDefaults()
    }
  }, [settings, ensureDefaults])

  const allActiveIds = useMemo(
    () => (comparisonRows ?? []).map((row) => row.prospect._id),
    [comparisonRows],
  )

  const urlIds = useMemo(() => parseIds(idsParam), [idsParam])

  const selectedIds = useMemo(() => {
    if (urlIds.length > 0) {
      const activeSet = new Set(allActiveIds)
      const filtered = urlIds.filter((id) => activeSet.has(id))
      return filtered.length > 0 ? filtered : allActiveIds
    }
    return allActiveIds
  }, [urlIds, allActiveIds])

  const pickerOptions = useMemo(
    () =>
      (comparisonRows ?? []).map((row) => ({
        id: row.prospect._id,
        title: row.prospect.title,
        brand: row.prospect.brand,
        model: row.prospect.model,
      })),
    [comparisonRows],
  )

  const comparisonProspects = useMemo(() => {
    if (
      comparisonRows === undefined ||
      equipmentCatalog === undefined ||
      settings === undefined ||
      settings === null
    ) {
      return []
    }

    const selectedSet = new Set(selectedIds)
    const filteredRows = comparisonRows.filter((row) => selectedSet.has(row.prospect._id))
    const catalog = equipmentCatalog.map((item) => ({
      _id: item._id,
      name: item.name,
      priority: item.priority,
    }))

    return buildComparisonProspects(filteredRows, settings, catalog)
  }, [comparisonRows, equipmentCatalog, settings, selectedIds])

  const tableRows = useMemo(() => buildComparisonRows(sv.compare.sections, sv.compare.fields), [])

  const loading =
    comparisonRows === undefined ||
    equipmentCatalog === undefined ||
    settings === undefined ||
    settings === null

  function updateSelection(ids: Id<'prospects'>[]) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ids: serializeIds(ids),
      }),
      replace: true,
    })
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{sv.compare.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{sv.compare.description}</p>
        </div>

        {loading ? (
          <CompareSkeleton />
        ) : (
          <>
            <ProspectPicker
              options={pickerOptions}
              selectedIds={selectedIds}
              onChange={updateSelection}
            />

            {comparisonProspects.length === 0 ? (
              <EmptyState
                title={
                  pickerOptions.length === 0
                    ? sv.compare.noActiveProspects
                    : sv.compare.emptySelection
                }
              />
            ) : (
              <>
                {comparisonProspects.length > 5 ? (
                  <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                    {sv.compare.manyColumnsWarning}
                  </p>
                ) : null}

                <div className="hidden lg:block">
                  <ComparisonTable rows={tableRows} prospects={comparisonProspects} />
                </div>

                <div className="lg:hidden">
                  <ComparisonCards prospects={comparisonProspects} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

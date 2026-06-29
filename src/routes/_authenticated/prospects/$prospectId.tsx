import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '~/components/layout/AppShell'
import { ConfirmDialog } from '~/components/layout/ConfirmDialog'
import { DashboardSkeleton } from '~/components/layout/LoadingSkeletons'
import { EmptyState } from '~/components/layout/EmptyState'
import { ProspectActionBar } from '~/components/prospects/ProspectActionBar'
import { ProspectCostSection } from '~/components/prospects/ProspectCostSection'
import { ProspectDetailSections } from '~/components/prospects/ProspectDetailSections'
import { ProspectFormDrawer } from '~/components/prospects/ProspectFormDrawer'
import { NoteFormDrawer } from '~/components/social/NoteFormDrawer'
import { NotesList } from '~/components/social/NotesList'
import { RatingDrawer } from '~/components/social/RatingDrawer'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { buildComparisonProspects } from '~/lib/comparison/buildComparisonProspects'
import { buildMonthlySchedule } from '~/lib/cost-engine'
import { sv } from '~/lib/i18n/sv'
import { toast } from '~/lib/toast'
import {
  toCompletionItems,
  toCostEngineSettings,
  toProspectCostInput,
} from '~/lib/prospect/costMapping'
import { api } from '../../../../convex/_generated/api'
import type { Doc, Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_authenticated/prospects/$prospectId')({
  component: ProspectDetailPage,
})

type NoteRow = Doc<'notes'> & {
  authorName: string
  isOwn: boolean
}

function ProspectDetailPage() {
  const { prospectId } = Route.useParams()
  const typedId = prospectId as Id<'prospects'>

  const pageData = useQuery(api.prospects.getPageData, { id: typedId })
  const settings = useQuery(api.settings.get)
  const archiveProspect = useMutation(api.prospects.archive)
  const removeNote = useMutation(api.social.removeNote)

  const [editOpen, setEditOpen] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteRow | undefined>(undefined)
  const [deleteNoteTarget, setDeleteNoteTarget] = useState<NoteRow | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)

  const formatted = useMemo(() => {
    if (
      pageData === undefined ||
      pageData === null ||
      settings === undefined ||
      settings === null
    ) {
      return null
    }

    const catalog = pageData.equipmentCatalog.map((item) => ({
      _id: item._id,
      name: item.name,
      priority: item.priority,
    }))

    const rows = buildComparisonProspects(
      [
        {
          prospect: pageData.prospect,
          purchaseItems: pageData.purchaseItems,
          equipment: pageData.equipmentRows,
          sourceLinks: pageData.sourceLinks,
          avgScore: pageData.avgScore,
          ratingCount: pageData.ratingCount,
          vetoCount: pageData.vetoes.length,
          hasVeto: pageData.vetoes.length > 0,
        },
      ],
      {
        annualKm: settings.annualKm,
        petrolPriceSekPerLiter: settings.petrolPriceSekPerLiter,
        dieselPriceSekPerLiter: settings.dieselPriceSekPerLiter,
        kwhPriceSekPerKwh: settings.kwhPriceSekPerKwh,
        hybridFuelPercent: settings.hybridFuelPercent,
        hybridLitersPerMil: settings.hybridLitersPerMil,
        hybridKwhPerMil: settings.hybridKwhPerMil,
        ownershipMonths: settings.ownershipMonths,
      },
      catalog,
    )

    return rows[0] ?? null
  }, [pageData, settings])

  const projection = useMemo(() => {
    if (
      pageData === undefined ||
      pageData === null ||
      settings === undefined ||
      settings === null
    ) {
      return null
    }

    return buildMonthlySchedule(
      toProspectCostInput(pageData.prospect),
      toCostEngineSettings({
        annualKm: settings.annualKm,
        petrolPriceSekPerLiter: settings.petrolPriceSekPerLiter,
        dieselPriceSekPerLiter: settings.dieselPriceSekPerLiter,
        kwhPriceSekPerKwh: settings.kwhPriceSekPerKwh,
        hybridFuelPercent: settings.hybridFuelPercent,
        hybridLitersPerMil: settings.hybridLitersPerMil,
        hybridKwhPerMil: settings.hybridKwhPerMil,
        ownershipMonths: settings.ownershipMonths,
      }),
      toCompletionItems(pageData.purchaseItems),
    )
  }, [pageData, settings])

  const presentEquipment = useMemo(() => {
    if (pageData === undefined || pageData === null) {
      return []
    }
    const catalogById = new Map(pageData.equipmentCatalog.map((item) => [item._id, item]))
    return pageData.equipmentRows
      .filter((row) => row.isPresent)
      .map((row) => catalogById.get(row.equipmentId))
      .filter((item): item is NonNullable<typeof item> => item !== undefined)
  }, [pageData])

  if (pageData === undefined || settings === undefined) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    )
  }

  if (pageData === null) {
    throw notFound()
  }

  const settingsMissing = settings === null
  const avgRatingLabel =
    pageData.ratingCount > 0 && pageData.avgScore !== null
      ? `${pageData.avgScore.toFixed(1)}/5 (${pageData.ratingCount} ${sv.dashboard.ratingCountLabel})`
      : sv.detail.noRating

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link to="/prospects" className="hover:text-foreground">
            {sv.detail.breadcrumbProspects}
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">{pageData.prospect.title}</span>
        </nav>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                  {pageData.prospect.title}
                </h1>
                {pageData.prospect.status === 'archived' ? (
                  <Badge variant="secondary">{sv.detail.archivedBadge}</Badge>
                ) : null}
                {pageData.vetoes.length > 0 ? (
                  <Badge variant="destructive">{sv.detail.vetoBadge}</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-muted-foreground">
                {pageData.prospect.brand} {pageData.prospect.model}
              </p>
            </div>
          </div>

          <ProspectActionBar
            prospectId={typedId}
            prospectStatus={pageData.prospect.status === 'archived' ? 'archived' : 'active'}
            ratings={pageData.ratings.map((rating) => ({
              userName: rating.userName,
              score: rating.score,
            }))}
            vetoes={pageData.vetoes.map((veto) => ({ userName: veto.userName }))}
            myVeto={pageData.myVeto}
            myReminder={pageData.myReminder}
            onEdit={() => setEditOpen(true)}
            onRate={() => setRateOpen(true)}
            onAddNote={() => {
              setEditingNote(undefined)
              setNoteOpen(true)
            }}
            onArchive={() => setArchiveOpen(true)}
          />
        </div>

        {settingsMissing ? (
          <EmptyState title={sv.settings.requiredForCosts} className="border-none py-4" />
        ) : formatted !== null && projection !== null ? (
          <>
            <ProspectCostSection
              prospectId={typedId}
              title={pageData.prospect.title}
              projection={projection}
            />

            <ProspectDetailSections
              formatted={formatted}
              prospect={pageData.prospect}
              equipment={presentEquipment}
              purchaseItems={pageData.purchaseItems}
              sourceLinks={pageData.sourceLinks}
            />
          </>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>{sv.detail.ratings}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {sv.detail.avgRating}: {avgRatingLabel}
              {pageData.myRating !== null
                ? ` · ${sv.detail.yourRating}: ${pageData.myRating}/5`
                : null}
            </p>
          </CardHeader>
          <CardContent>
            {pageData.ratings.length === 0 ? (
              <p className="text-sm text-muted-foreground">{sv.detail.noRating}</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {pageData.ratings.map((rating) => (
                  <li
                    key={rating._id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>{rating.userName}</span>
                    <span className="font-medium">{rating.score}/5</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{sv.detail.notes}</CardTitle>
          </CardHeader>
          <CardContent>
            <NotesList
              notes={pageData.notes}
              onEdit={(note) => {
                setEditingNote(note)
                setNoteOpen(true)
              }}
              onDelete={(note) => setDeleteNoteTarget(note)}
            />
          </CardContent>
        </Card>
      </div>

      <ProspectFormDrawer open={editOpen} onOpenChange={setEditOpen} prospectId={typedId} />

      <RatingDrawer
        open={rateOpen}
        onOpenChange={setRateOpen}
        prospectId={typedId}
        currentScore={pageData.myRating}
      />

      <NoteFormDrawer
        open={noteOpen}
        onOpenChange={(open) => {
          setNoteOpen(open)
          if (!open) {
            setEditingNote(undefined)
          }
        }}
        prospectId={typedId}
        note={editingNote}
      />

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={sv.prospects.archiveTitle}
        description={sv.prospects.archiveDescription}
        confirmLabel={sv.prospects.archive}
        onConfirm={() => {
          void archiveProspect({ id: typedId }).catch(() => {
            toast.error()
          })
        }}
      />

      <ConfirmDialog
        open={deleteNoteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteNoteTarget(null)
          }
        }}
        title={sv.detail.deleteNoteTitle}
        description={sv.detail.deleteNoteDescription}
        onConfirm={() => {
          if (deleteNoteTarget === null) {
            return
          }
          void removeNote({ id: deleteNoteTarget._id }).catch(() => {
            toast.deleteError()
          })
        }}
      />
    </AppShell>
  )
}

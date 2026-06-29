import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Archive, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '~/components/layout/AppShell'
import { ConfirmDialog } from '~/components/layout/ConfirmDialog'
import { EmptyState } from '~/components/layout/EmptyState'
import { TableSkeleton } from '~/components/layout/LoadingSkeletons'
import { ProspectFormDrawer } from '~/components/prospects/ProspectFormDrawer'
import { SocialCompact } from '~/components/social/SocialCompact'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { formatSek } from '~/lib/format'
import { sv } from '~/lib/i18n/sv'
import { toast } from '~/lib/toast'
import { engineTypeLabel, purchaseMethodLabel } from '~/lib/prospect/labels'
import type { ProspectStatus } from '~/lib/prospect/types'
import { api } from '../../../../convex/_generated/api'
import type { Doc, Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_authenticated/prospects/')({
  component: ProspectsPage,
})

function ProspectsPage() {
  const [statusFilter, setStatusFilter] =
    useState<Extract<ProspectStatus, 'active' | 'archived'>>('active')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Doc<'prospects'> | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Doc<'prospects'> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doc<'prospects'> | null>(null)

  const listArgs = useMemo(() => ({ status: statusFilter }), [statusFilter])
  const prospects = useQuery(api.prospects.list, listArgs)
  const prospectIds = useMemo(() => (prospects ?? []).map((p) => p._id), [prospects])
  const socialSummaries = useQuery(
    api.social.summariesForProspects,
    prospectIds.length > 0 ? { prospectIds } : 'skip',
  )
  const archiveProspect = useMutation(api.prospects.archive)
  const removeProspect = useMutation(api.prospects.remove)

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold">{sv.prospects.title}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{sv.prospects.description}</p>
          </div>
          <Button
            onClick={() => {
              setEditing(null)
              setDrawerOpen(true)
            }}
          >
            {sv.prospects.add}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">{sv.prospects.filterStatus}</span>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as Extract<ProspectStatus, 'active' | 'archived'>)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{sv.prospects.statusActive}</SelectItem>
              <SelectItem value="archived">{sv.prospects.statusArchived}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {prospects === undefined ? (
          <TableSkeleton rows={6} columns={6} />
        ) : prospects.length === 0 ? (
          <EmptyState title={sv.prospects.empty} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{sv.prospects.columns.title}</TableHead>
                <TableHead>{sv.prospects.columns.brand}</TableHead>
                <TableHead>{sv.prospects.columns.engine}</TableHead>
                <TableHead>{sv.prospects.columns.method}</TableHead>
                <TableHead>{sv.prospects.columns.price}</TableHead>
                <TableHead>{sv.prospects.columns.social}</TableHead>
                <TableHead className="text-right">{sv.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect._id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/prospects/$prospectId"
                      params={{ prospectId: prospect._id }}
                      className="hover:text-primary hover:underline"
                    >
                      {prospect.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {prospect.brand} {prospect.model}
                  </TableCell>
                  <TableCell>{engineTypeLabel(prospect.engineType)}</TableCell>
                  <TableCell>{purchaseMethodLabel(prospect.purchaseMethod)}</TableCell>
                  <TableCell>{formatSek(prospect.buyPriceSek)}</TableCell>
                  <TableCell>
                    <SocialCompact
                      avgScore={socialSummaries?.[prospect._id]?.avgScore ?? null}
                      ratingCount={socialSummaries?.[prospect._id]?.ratingCount ?? 0}
                      vetoCount={socialSummaries?.[prospect._id]?.vetoCount ?? 0}
                      hasVeto={socialSummaries?.[prospect._id]?.hasVeto ?? false}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={sv.common.edit}
                        onClick={() => {
                          setEditing(prospect)
                          setDrawerOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      {statusFilter === 'active' ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={sv.prospects.archive}
                          onClick={() => {
                            setArchiveTarget(prospect)
                          }}
                        >
                          <Archive />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={sv.common.delete}
                          onClick={() => {
                            setDeleteTarget(prospect)
                          }}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      </div>

      <ProspectFormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) {
            setEditing(null)
          }
        }}
        prospectId={editing?._id as Id<'prospects'> | undefined}
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveTarget(null)
          }
        }}
        title={sv.prospects.archiveTitle}
        description={sv.prospects.archiveDescription}
        confirmLabel={sv.prospects.archive}
        onConfirm={() => {
          if (archiveTarget === null) {
            return
          }
          void archiveProspect({ id: archiveTarget._id }).catch(() => {
            toast.error()
          })
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        title={sv.prospects.deleteTitle}
        description={sv.prospects.deleteDescription}
        onConfirm={() => {
          if (deleteTarget === null) {
            return
          }
          void removeProspect({ id: deleteTarget._id }).catch(() => {
            toast.deleteError()
          })
        }}
      />
    </AppShell>
  )
}

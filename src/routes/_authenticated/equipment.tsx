import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EquipmentFormDrawer } from '~/components/equipment/EquipmentFormDrawer'
import { EquipmentPriorityBadge } from '~/components/equipment/EquipmentPriorityBadge'
import { AppShell } from '~/components/layout/AppShell'
import { ConfirmDialog } from '~/components/layout/ConfirmDialog'
import { EmptyState } from '~/components/layout/EmptyState'
import { TableSkeleton } from '~/components/layout/LoadingSkeletons'
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
import { equipmentCategories, equipmentCategoryLabel } from '~/lib/equipment/labels'
import type { EquipmentCategory } from '~/lib/equipment/types'
import { sv } from '~/lib/i18n/sv'
import { toast } from '~/lib/toast'
import type { EquipmentFormInput } from '~/lib/validation/equipment'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_authenticated/equipment')({
  component: EquipmentPage,
})

function EquipmentPage() {
  const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | 'all'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Doc<'equipment'> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doc<'equipment'> | null>(null)

  const listArgs = useMemo(
    () => (categoryFilter === 'all' ? {} : { category: categoryFilter }),
    [categoryFilter],
  )
  const equipment = useQuery(api.equipment.list, listArgs)
  const removeEquipment = useMutation(api.equipment.remove)

  const drawerInitialValues: EquipmentFormInput | undefined = editing
    ? {
        name: editing.name,
        category: editing.category,
        priority: editing.priority,
      }
    : undefined

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold">{sv.equipment.title}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{sv.equipment.description}</p>
          </div>
          <Button
            onClick={() => {
              setEditing(null)
              setDrawerOpen(true)
            }}
          >
            {sv.equipment.add}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">{sv.equipment.filterCategory}</span>
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as EquipmentCategory | 'all')}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{sv.common.all}</SelectItem>
              {equipmentCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {equipmentCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {equipment === undefined ? (
          <TableSkeleton rows={5} columns={4} />
        ) : equipment.length === 0 ? (
          <EmptyState title={sv.equipment.empty} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{sv.equipment.name}</TableHead>
                <TableHead>{sv.equipment.category}</TableHead>
                <TableHead>{sv.equipment.priority}</TableHead>
                <TableHead className="text-right">{sv.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{equipmentCategoryLabel(item.category)}</TableCell>
                  <TableCell>
                    <EquipmentPriorityBadge priority={item.priority} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={sv.common.edit}
                        onClick={() => {
                          setEditing(item)
                          setDrawerOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={sv.common.delete}
                        onClick={() => {
                          setDeleteTarget(item)
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <EquipmentFormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) {
            setEditing(null)
          }
        }}
        equipmentId={editing?._id as Id<'equipment'> | undefined}
        initialValues={drawerInitialValues}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        title={sv.equipment.deleteTitle}
        description={sv.equipment.deleteDescription}
        onConfirm={() => {
          if (deleteTarget === null) {
            return
          }
          void removeEquipment({ id: deleteTarget._id }).catch(() => {
            toast.deleteError()
          })
        }}
      />
    </AppShell>
  )
}

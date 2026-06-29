import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { EquipmentWarningBadge } from '~/components/equipment/EquipmentWarningBadge'
import { NiceToHaveIndicator } from '~/components/equipment/NiceToHaveIndicator'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import type { ComparisonProspect, ComparisonRow } from '~/lib/comparison/buildComparisonProspects'
import { sv } from '~/lib/i18n/sv'

type ComparisonTableProps = {
  rows: ComparisonRow[]
  prospects: ComparisonProspect[]
}

const columnHelper = createColumnHelper<ComparisonRow>()

function renderProspectCell(row: ComparisonRow, prospect: ComparisonProspect) {
  if (row.isSectionHeader) {
    return null
  }

  switch (row.id) {
    case 'missingMustHave':
      return <EquipmentWarningBadge missing={prospect.missingMustHave} />
    case 'includedNiceToHave':
      return <NiceToHaveIndicator included={prospect.includedNiceToHave} />
    case 'sourceLinks':
      if (prospect.links.length === 0) {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <ul className="grid gap-1">
          {prospect.links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      )
    case 'veto':
      if (prospect.vetoCount === 0) {
        return '—'
      }
      return (
        <span className="inline-flex items-center gap-2">
          {prospect.vetoCount}
          {prospect.hasVeto ? <Badge variant="destructive">{sv.dashboard.vetoBadge}</Badge> : null}
        </span>
      )
    default:
      return row.getValue(prospect)
  }
}

export function ComparisonTable({ rows, prospects }: ComparisonTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('label', {
        id: 'label',
        header: () => null,
        cell: ({ row }) => (
          <span className={row.original.isSectionHeader ? 'font-semibold' : undefined}>
            {row.original.label}
          </span>
        ),
      }),
      ...prospects.map((prospect) =>
        columnHelper.display({
          id: prospect.id,
          header: () => (
            <div className="grid gap-1">
              <span className="font-semibold">{prospect.title}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {prospect.brand} {prospect.model}
              </span>
              {prospect.hasVeto ? (
                <Badge variant="destructive" className="w-fit">
                  {sv.dashboard.vetoBadge}
                </Badge>
              ) : null}
            </div>
          ),
          cell: ({ row }) => renderProspectCell(row.original, prospect),
        }),
      ),
    ],
    [prospects],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={
                    index === 0
                      ? 'sticky left-0 z-20 min-w-44 bg-muted/80 backdrop-blur-sm'
                      : 'min-w-48 bg-muted/50'
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((tableRow) => (
            <TableRow
              key={tableRow.id}
              className={tableRow.original.isSectionHeader ? 'bg-muted/30' : undefined}
            >
              {tableRow.getVisibleCells().map((cell, index) => (
                <TableCell
                  key={cell.id}
                  className={
                    index === 0
                      ? 'sticky left-0 z-10 bg-background'
                      : tableRow.original.isSectionHeader
                        ? 'bg-muted/30'
                        : undefined
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

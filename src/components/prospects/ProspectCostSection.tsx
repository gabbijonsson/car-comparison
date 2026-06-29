import { useMemo, useState } from 'react'
import { type CostChartSeries, CostLineChart } from '~/components/costs/CostLineChart'
import { EmptyState } from '~/components/layout/EmptyState'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
import type { CostCategory, CostProjection } from '~/lib/cost-engine'
import { COST_CATEGORIES } from '~/lib/cost-engine'
import { costCategoryLabel } from '~/lib/cost-engine/categoryLabels'
import { formatSek } from '~/lib/format'
import { sv } from '~/lib/i18n/sv'
import type { Id } from '../../../convex/_generated/dataModel'

type ProspectCostSectionProps = {
  prospectId: Id<'prospects'>
  title: string
  projection: CostProjection
}

export function ProspectCostSection({ prospectId, title, projection }: ProspectCostSectionProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<CostCategory | 'all'>('all')

  const chartSeries = useMemo((): CostChartSeries[] => {
    return [
      {
        prospectId,
        key: 'cost',
        label: title,
        hasVeto: false,
        cumulativeByMonth: projection.months.map((row) => row.cumulativeSek),
      },
    ]
  }, [prospectId, title, projection.months])

  const detailRows = useMemo(() => {
    return projection.months
      .map((row) => {
        const filteredItems =
          categoryFilter === 'all'
            ? row.items
            : row.items.filter((item) => item.category === categoryFilter)
        const monthTotal = filteredItems.reduce((sum, item) => sum + item.amountSek, 0)
        return { month: row.month, items: filteredItems, monthTotal, cumulative: row.cumulativeSek }
      })
      .filter((row) => row.monthTotal > 0)
  }, [projection.months, categoryFilter])

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{sv.compare.fields.total3yr}</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold tabular-nums">
            {formatSek(projection.totals.months36)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{sv.compare.fields.total5yr}</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold tabular-nums">
            {formatSek(projection.totals.months60)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{sv.compare.fields.total10yr}</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold tabular-nums">
            {formatSek(projection.totals.months120)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>{sv.detail.costChart}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowDetails((value) => !value)}>
            {showDetails ? sv.detail.hideDetails : sv.detail.showDetails}
          </Button>
        </CardHeader>
        <CardContent>
          <CostLineChart series={chartSeries} />
        </CardContent>
      </Card>

      {showDetails ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>{sv.detail.costBreakdown}</CardTitle>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as CostCategory | 'all')}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{sv.detail.categoryAll}</SelectItem>
                {COST_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {costCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {detailRows.length === 0 ? (
              <EmptyState title={sv.common.empty} className="border-none py-4" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{sv.detail.month}</TableHead>
                    <TableHead>{sv.detail.item}</TableHead>
                    <TableHead className="text-right">{sv.detail.amount}</TableHead>
                    <TableHead className="text-right">{sv.detail.cumulative}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailRows.flatMap((row) =>
                    row.items.map((item) => (
                      <TableRow
                        key={`${row.month}-${item.category}-${item.label ?? ''}-${item.amountSek}`}
                      >
                        <TableCell>{row.month}</TableCell>
                        <TableCell>{item.label ?? costCategoryLabel(item.category)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatSek(item.amountSek)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatSek(row.cumulative)}
                        </TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

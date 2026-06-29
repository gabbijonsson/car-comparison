import { Archive } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { EmptyState } from '~/components/layout/EmptyState'
import { formatSek } from '~/lib/format'
import { sv } from '~/lib/i18n/sv'
import type { Id } from '../../../convex/_generated/dataModel'

const CHART_COLOR_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

export type CostChartSeries = {
  prospectId: Id<'prospects'>
  key: string
  label: string
  hasVeto: boolean
  cumulativeByMonth: number[]
}

type CostLineChartProps = {
  series: CostChartSeries[]
  onArchive?: (prospectId: Id<'prospects'>) => void
}

function buildChartRows(series: CostChartSeries[]) {
  const monthCount = series[0]?.cumulativeByMonth.length ?? 120
  return Array.from({ length: monthCount }, (_, month) => {
    const row: Record<string, number> = { month: month + 1 }
    for (const line of series) {
      row[line.key] = line.cumulativeByMonth[month] ?? 0
    }
    return row
  })
}

function buildChartConfig(series: CostChartSeries[]): ChartConfig {
  return Object.fromEntries(
    series.map((line, index) => [
      line.key,
      {
        label: line.label,
        color: CHART_COLOR_VARS[index % CHART_COLOR_VARS.length],
      },
    ]),
  )
}

function formatMonthTick(month: number): string {
  if (month === 1) {
    return '0'
  }
  if ((month - 1) % 12 === 0) {
    return String(Math.floor((month - 1) / 12))
  }
  return ''
}

export function CostLineChart({ series, onArchive }: CostLineChartProps) {
  if (series.length === 0) {
    return <EmptyState title={sv.dashboard.chartEmpty} className="border-none py-8" />
  }

  const chartData = buildChartRows(series)
  const config = buildChartConfig(series)

  return (
    <div className="grid gap-4">
      <div className="max-md:-mx-2 max-md:overflow-x-auto max-md:px-2">
        <ChartContainer
          config={config}
          className="aspect-2/1 min-h-60 w-full min-w-[280px] md:min-h-72"
        >
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatMonthTick}
              label={{
                value: sv.dashboard.chartXAxis,
                position: 'insideBottom',
                offset: -4,
                className: 'fill-muted-foreground text-xs',
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={72}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('sv-SE', {
                  notation: 'compact',
                  maximumFractionDigits: 0,
                }).format(value)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const month = payload?.[0]?.payload?.month
                    return typeof month === 'number'
                      ? sv.dashboard.chartTooltipMonth.replace('{month}', String(month))
                      : ''
                  }}
                  formatter={(value, _name, item) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatSek(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            {series.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={`var(--color-${line.key})`}
                strokeWidth={2}
                strokeDasharray={line.hasVeto ? '6 4' : undefined}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>

      <ul className="flex flex-wrap gap-1 md:hidden">
        {series.map((line, index) => (
          <li
            key={line.prospectId}
            className="flex max-w-full items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-xs"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: CHART_COLOR_VARS[index % CHART_COLOR_VARS.length],
                ...(line.hasVeto
                  ? {
                      backgroundImage:
                        'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)',
                    }
                  : {}),
              }}
            />
            <span className="truncate font-medium">{line.label}</span>
            {line.hasVeto ? (
              <span className="shrink-0 text-destructive" title={sv.dashboard.vetoBadge}>
                ✕
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <ul className="hidden flex-wrap gap-2 md:flex">
        {series.map((line, index) => (
          <li
            key={line.prospectId}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: CHART_COLOR_VARS[index % CHART_COLOR_VARS.length],
                ...(line.hasVeto
                  ? {
                      backgroundImage:
                        'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)',
                    }
                  : {}),
              }}
            />
            <span className="font-medium">{line.label}</span>
            {line.hasVeto ? <Badge variant="destructive">{sv.dashboard.vetoBadge}</Badge> : null}
            {line.hasVeto && onArchive ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={sv.dashboard.archiveVetoed}
                onClick={() => onArchive(line.prospectId)}
              >
                <Archive />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

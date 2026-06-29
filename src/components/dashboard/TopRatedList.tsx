import { EmptyState } from '~/components/layout/EmptyState'
import { Badge } from '~/components/ui/badge'
import { sv } from '~/lib/i18n/sv'
import type { Id } from '../../../convex/_generated/dataModel'

type RatingRow = {
  prospectId: Id<'prospects'>
  title: string
  brand: string
  model: string
  avgScore: number | null
  ratingCount: number
  hasVeto: boolean
}

type TopRatedListProps = {
  rows: RatingRow[]
}

function formatAvg(score: number | null): string {
  if (score === null) {
    return '—'
  }
  return score.toFixed(1)
}

export function TopRatedList({ rows }: TopRatedListProps) {
  const rated = rows.filter((row) => row.ratingCount > 0)

  if (rated.length === 0) {
    return <EmptyState title={sv.dashboard.topRatedEmpty} className="border-none py-6" />
  }

  return (
    <ol className="grid gap-2">
      {rated.map((row, index) => (
        <li
          key={row.prospectId}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{index + 1}.</span>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.brand} {row.model}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {row.hasVeto ? <Badge variant="destructive">{sv.dashboard.vetoBadge}</Badge> : null}
            <span className="font-medium tabular-nums">{formatAvg(row.avgScore)}/5</span>
            <span className="text-xs text-muted-foreground">
              ({row.ratingCount} {sv.dashboard.ratingCountLabel})
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

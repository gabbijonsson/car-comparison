import { Badge } from '~/components/ui/badge'
import { sv } from '~/lib/i18n/sv'

type SocialCompactProps = {
  avgScore: number | null
  ratingCount: number
  vetoCount: number
  hasVeto: boolean
}

function formatAvg(score: number | null, ratingCount: number): string {
  if (ratingCount === 0 || score === null) {
    return '—'
  }
  return `${score.toFixed(1)}/5`
}

export function SocialCompact({ avgScore, ratingCount, vetoCount, hasVeto }: SocialCompactProps) {
  if (ratingCount === 0 && vetoCount === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ratingCount > 0 ? (
        <span className="tabular-nums">
          {formatAvg(avgScore, ratingCount)}
          <span className="text-muted-foreground"> ({ratingCount})</span>
        </span>
      ) : null}
      {hasVeto ? (
        <Badge variant="destructive">
          {sv.dashboard.vetoBadge}
          {vetoCount > 1 ? ` (${vetoCount})` : null}
        </Badge>
      ) : null}
    </div>
  )
}

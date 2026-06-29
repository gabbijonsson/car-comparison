import { Star } from 'lucide-react'
import { cn } from '~/lib/utils'

type RatingControlProps = {
  value: number
  onChange: (score: number) => void
  size?: 'sm' | 'md'
  disabled?: boolean
}

const sizeClasses = {
  sm: 'size-6',
  md: 'size-8',
} as const

export function RatingControl({
  value,
  onChange,
  size = 'md',
  disabled = false,
}: RatingControlProps) {
  return (
    <fieldset
      className="flex justify-center gap-2 border-0 p-0"
      aria-label="Betyg 1–5"
      disabled={disabled}
    >
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          aria-label={`${score}/5`}
          aria-pressed={score <= value}
          className="rounded-md p-2 transition-colors hover:bg-muted disabled:opacity-50"
          onClick={() => onChange(score)}
        >
          <Star
            className={cn(
              sizeClasses[size],
              score <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground',
            )}
          />
        </button>
      ))}
    </fieldset>
  )
}

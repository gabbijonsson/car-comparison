import { Skeleton } from '~/components/ui/skeleton'

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Laddar">
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={`row-${row}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={`cell-${row}-${col}`} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="grid gap-2" aria-busy="true" aria-label="Laddar">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-label="Laddar">
      <Skeleton className="h-72 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  )
}

export function CompareSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Laddar">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="hidden h-96 w-full rounded-lg lg:block" />
      <div className="grid gap-3 lg:hidden">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="grid max-w-2xl gap-6" aria-busy="true" aria-label="Laddar">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

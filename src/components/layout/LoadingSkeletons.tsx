import { Skeleton } from '~/components/ui/skeleton'

const skeletonStatusProps = {
  'aria-busy': true as const,
  'aria-label': 'Laddar',
  role: 'status' as const,
}

function skeletonKeys(count: number, prefix: string) {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index}`)
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  const headKeys = skeletonKeys(columns, 'head')
  const rowKeys = skeletonKeys(rows, 'row')

  return (
    <div className="grid gap-3" {...skeletonStatusProps}>
      <div className="flex gap-4 border-b border-border pb-3">
        {headKeys.map((key) => (
          <Skeleton key={key} className="h-4 flex-1" />
        ))}
      </div>
      {rowKeys.map((rowKey) => (
        <div key={rowKey} className="flex gap-4">
          {skeletonKeys(columns, `${rowKey}-cell`).map((cellKey) => (
            <Skeleton key={cellKey} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  const itemKeys = skeletonKeys(items, 'list-item')

  return (
    <div className="grid gap-2" {...skeletonStatusProps}>
      {itemKeys.map((key) => (
        <Skeleton key={key} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-8" {...skeletonStatusProps}>
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
    <div className="grid gap-6" {...skeletonStatusProps}>
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
  const fieldKeys = skeletonKeys(6, 'settings-field')

  return (
    <div className="grid max-w-2xl gap-6" {...skeletonStatusProps}>
      {fieldKeys.map((key) => (
        <div key={key} className="grid gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

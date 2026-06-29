import { AlertCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import type { EquipmentCatalogEntry } from '~/lib/equipment/helpers'
import { sv } from '~/lib/i18n/sv'

type EquipmentWarningBadgeProps = {
  missing: EquipmentCatalogEntry[]
}

export function EquipmentWarningBadge({ missing }: EquipmentWarningBadgeProps) {
  if (missing.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center gap-1 text-destructive hover:text-destructive/80"
        aria-label={sv.compare.missingMustHave}
        openOnHover
      >
        <AlertCircle className="size-4 shrink-0" />
        <span className="font-medium">{missing.length}</span>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 font-medium">{sv.compare.missingMustHave}</p>
        <ul className="grid gap-1 text-sm">
          {missing.map((item) => (
            <li key={item._id}>{item.name}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

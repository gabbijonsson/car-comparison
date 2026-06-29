import { CheckCircle2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import type { EquipmentCatalogEntry } from '~/lib/equipment/helpers'
import { sv } from '~/lib/i18n/sv'

type NiceToHaveIndicatorProps = {
  included: EquipmentCatalogEntry[]
}

export function NiceToHaveIndicator({ included }: NiceToHaveIndicatorProps) {
  if (included.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-600/80 dark:text-emerald-400"
        aria-label={sv.compare.includedNiceToHave}
        openOnHover
      >
        <CheckCircle2 className="size-4 shrink-0" />
        <span className="font-medium">{included.length}</span>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 font-medium">{sv.compare.includedNiceToHave}</p>
        <ul className="grid gap-1 text-sm">
          {included.map((item) => (
            <li key={item._id}>{item.name}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

import { Badge } from '~/components/ui/badge'
import { equipmentPriorityLabel } from '~/lib/equipment/labels'
import type { EquipmentPriority } from '~/lib/equipment/types'

const priorityVariant: Record<EquipmentPriority, 'default' | 'secondary' | 'outline'> = {
  must: 'default',
  nice: 'secondary',
  neutral: 'outline',
}

type EquipmentPriorityBadgeProps = {
  priority: EquipmentPriority
}

export function EquipmentPriorityBadge({ priority }: EquipmentPriorityBadgeProps) {
  return <Badge variant={priorityVariant[priority]}>{equipmentPriorityLabel(priority)}</Badge>
}

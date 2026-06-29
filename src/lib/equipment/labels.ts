import type { EquipmentCategory, EquipmentPriority } from '~/lib/equipment/types'
import { sv } from '~/lib/i18n/sv'

export function equipmentCategoryLabel(category: EquipmentCategory): string {
  return sv.equipment.categories[category]
}

export function equipmentPriorityLabel(priority: EquipmentPriority): string {
  return sv.equipment.priorities[priority]
}

export const equipmentCategories = equipmentCategorySchemaValues()

export const equipmentPriorities = equipmentPrioritySchemaValues()

function equipmentCategorySchemaValues(): EquipmentCategory[] {
  return [
    'safety',
    'comfort',
    'winter',
    'audio',
    'driver_assistance',
    'practical',
    'performance',
    'charging_electric',
    'other',
  ]
}

function equipmentPrioritySchemaValues(): EquipmentPriority[] {
  return ['must', 'nice', 'neutral']
}

import type { EquipmentPriority } from '~/lib/equipment/types'
import type { Id } from '../../../convex/_generated/dataModel'

export type EquipmentCatalogEntry = {
  _id: Id<'equipment'>
  name: string
  priority: EquipmentPriority
}

export type ProspectEquipmentJoin = {
  equipmentId: Id<'equipment'>
  isPresent: boolean
}

export function missingMustHave(
  joins: ProspectEquipmentJoin[],
  catalog: EquipmentCatalogEntry[],
): EquipmentCatalogEntry[] {
  const presentIds = new Set(joins.filter((join) => join.isPresent).map((join) => join.equipmentId))
  return catalog.filter((item) => item.priority === 'must' && !presentIds.has(item._id))
}

export function includedNiceToHave(
  joins: ProspectEquipmentJoin[],
  catalog: EquipmentCatalogEntry[],
): EquipmentCatalogEntry[] {
  const presentIds = new Set(joins.filter((join) => join.isPresent).map((join) => join.equipmentId))
  return catalog.filter((item) => item.priority === 'nice' && presentIds.has(item._id))
}

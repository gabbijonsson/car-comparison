import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export function normalizeEquipmentName(name: string): string {
  return name.trim().toLowerCase()
}

export async function findEquipmentByNormalizedName(
  ctx: QueryCtx | MutationCtx,
  name: string,
  excludeId?: Id<'equipment'>,
) {
  const normalized = normalizeEquipmentName(name)
  const all = await ctx.db.query('equipment').collect()
  return (
    all.find((item) => item.name.toLowerCase() === normalized && item._id !== excludeId) ?? null
  )
}

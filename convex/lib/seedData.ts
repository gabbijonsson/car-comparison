import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { DEFAULT_EQUIPMENT, DEFAULT_GLOBAL_SETTINGS, GLOBAL_SETTINGS_KEY } from './defaults'

export async function seedGlobalSettings(
  ctx: MutationCtx,
  actorUserId: Id<'users'>,
): Promise<Id<'globalSettings'>> {
  const existing = await ctx.db
    .query('globalSettings')
    .withIndex('by_key', (q) => q.eq('key', GLOBAL_SETTINGS_KEY))
    .unique()

  if (existing !== null) {
    return existing._id
  }

  const now = Date.now()
  return await ctx.db.insert('globalSettings', {
    ...DEFAULT_GLOBAL_SETTINGS,
    updatedAt: now,
    updatedBy: actorUserId,
  })
}

export async function seedEquipmentCatalog(
  ctx: MutationCtx,
  actorUserId: Id<'users'>,
): Promise<number> {
  const existing = await ctx.db.query('equipment').take(1)
  if (existing.length > 0) {
    return 0
  }

  const now = Date.now()
  for (const item of DEFAULT_EQUIPMENT) {
    await ctx.db.insert('equipment', {
      name: item.name,
      category: item.category,
      priority: item.priority,
      createdAt: now,
      createdBy: actorUserId,
    })
  }

  return DEFAULT_EQUIPMENT.length
}

export async function seedDefaults(
  ctx: MutationCtx,
  actorUserId: Id<'users'>,
): Promise<{ globalSettingsId: Id<'globalSettings'>; equipmentSeeded: number }> {
  const globalSettingsId = await seedGlobalSettings(ctx, actorUserId)
  const equipmentSeeded = await seedEquipmentCatalog(ctx, actorUserId)
  return { globalSettingsId, equipmentSeeded }
}

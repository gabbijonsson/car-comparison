import { mutation, query } from './_generated/server'
import { logActivity } from './lib/activity'
import { requireAuth } from './lib/auth'
import { GLOBAL_SETTINGS_KEY } from './lib/defaults'
import { seedDefaults } from './lib/seedData'
import { assertValidGlobalSettings, globalSettingsFieldsValidator } from './lib/validators'

export const get = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx)
    return await ctx.db
      .query('globalSettings')
      .withIndex('by_key', (q) => q.eq('key', GLOBAL_SETTINGS_KEY))
      .unique()
  },
})

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx)
    return await seedDefaults(ctx, userId)
  },
})

export const update = mutation({
  args: globalSettingsFieldsValidator,
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    assertValidGlobalSettings(args)
    const existing = await ctx.db
      .query('globalSettings')
      .withIndex('by_key', (q) => q.eq('key', GLOBAL_SETTINGS_KEY))
      .unique()

    const now = Date.now()
    if (existing === null) {
      const id = await ctx.db.insert('globalSettings', {
        key: GLOBAL_SETTINGS_KEY,
        ...args,
        updatedAt: now,
        updatedBy: userId,
      })
      await logActivity(ctx, {
        type: 'settings',
        actorUserId: userId,
        message: 'Globala inställningar skapades',
        metadata: { action: 'create' },
      })
      return id
    }

    await ctx.db.patch(existing._id, {
      ...args,
      updatedAt: now,
      updatedBy: userId,
    })
    await logActivity(ctx, {
      type: 'settings',
      actorUserId: userId,
      message: 'Globala inställningar uppdaterades',
      metadata: { action: 'update' },
    })
    return existing._id
  },
})

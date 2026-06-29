import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { logActivity } from './lib/activity'
import { requireAuth } from './lib/auth'
import { findEquipmentByNormalizedName } from './lib/equipmentHelpers'
import { equipmentCategoryValidator, equipmentPriorityValidator } from './lib/validators'

export const list = query({
  args: {
    category: v.optional(equipmentCategoryValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    if (args.category !== undefined) {
      const category = args.category
      return await ctx.db
        .query('equipment')
        .withIndex('by_category', (q) => q.eq('category', category))
        .collect()
    }
    return await ctx.db.query('equipment').collect()
  },
})

export const get = query({
  args: { id: v.id('equipment') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    category: equipmentCategoryValidator,
    priority: equipmentPriorityValidator,
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const name = args.name.trim()
    if (name.length === 0) {
      throw new Error('Namn krävs')
    }

    const existing = await findEquipmentByNormalizedName(ctx, name)
    if (existing !== null) {
      throw new Error('Utrustningen finns redan')
    }

    const now = Date.now()
    const id = await ctx.db.insert('equipment', {
      name,
      category: args.category,
      priority: args.priority,
      createdAt: now,
      createdBy: userId,
    })

    await logActivity(ctx, {
      type: 'equipment',
      actorUserId: userId,
      entityId: id,
      message: `Utrustning "${name}" lades till`,
      metadata: { equipmentName: name, action: 'add' },
    })

    return id
  },
})

export const update = mutation({
  args: {
    id: v.id('equipment'),
    name: v.string(),
    category: equipmentCategoryValidator,
    priority: equipmentPriorityValidator,
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const existing = await ctx.db.get(args.id)
    if (existing === null) {
      throw new Error('Utrustningen hittades inte')
    }

    const name = args.name.trim()
    if (name.length === 0) {
      throw new Error('Namn krävs')
    }

    const duplicate = await findEquipmentByNormalizedName(ctx, name, args.id)
    if (duplicate !== null) {
      throw new Error('Utrustningen finns redan')
    }

    await ctx.db.patch(args.id, {
      name,
      category: args.category,
      priority: args.priority,
    })

    await logActivity(ctx, {
      type: 'equipment',
      actorUserId: userId,
      entityId: args.id,
      message: `Utrustning "${name}" uppdaterades`,
      metadata: { equipmentName: name, action: 'update' },
    })

    return args.id
  },
})

export const remove = mutation({
  args: { id: v.id('equipment') },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const existing = await ctx.db.get(args.id)
    if (existing === null) {
      throw new Error('Utrustningen hittades inte')
    }

    const joins = await ctx.db
      .query('prospectEquipment')
      .withIndex('by_equipmentId', (q) => q.eq('equipmentId', args.id))
      .collect()

    for (const join of joins) {
      await ctx.db.delete(join._id)
    }

    await ctx.db.delete(args.id)

    await logActivity(ctx, {
      type: 'equipment',
      actorUserId: userId,
      entityId: args.id,
      message: `Utrustning "${existing.name}" togs bort`,
      metadata: { equipmentName: existing.name, action: 'remove' },
    })

    return args.id
  },
})

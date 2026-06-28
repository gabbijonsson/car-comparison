import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { logActivity } from './lib/activity'
import { requireAuth } from './lib/auth'
import {
  engineTypeValidator,
  financingValidator,
  prospectStatusValidator,
  purchaseMethodValidator,
} from './lib/validators'

const prospectFieldsValidator = {
  brand: v.string(),
  model: v.string(),
  title: v.string(),
  modelYear: v.optional(v.number()),
  registrationYear: v.optional(v.number()),
  mileage: v.optional(v.number()),
  engineType: engineTypeValidator,
  purchaseMethod: purchaseMethodValidator,
  buyPriceSek: v.number(),
  packageDescription: v.optional(v.string()),
  insuranceMonthlySek: v.number(),
  taxYearlySek: v.number(),
  serviceSmallSek: v.number(),
  serviceBigSek: v.number(),
  serviceIntervalMonths: v.number(),
  fuelConsumption: v.optional(v.number()),
  financing: v.optional(financingValidator),
  freeTextEquipmentTags: v.array(v.string()),
}

export const list = query({
  args: {
    status: v.optional(prospectStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    const status = args.status ?? 'active'
    return await ctx.db
      .query('prospects')
      .withIndex('by_status', (q) => q.eq('status', status))
      .collect()
  },
})

export const get = query({
  args: { id: v.id('prospects') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    const prospect = await ctx.db.get(args.id)
    if (prospect === null || prospect.status === 'deleted') {
      return null
    }
    return prospect
  },
})

export const create = mutation({
  args: prospectFieldsValidator,
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const now = Date.now()
    const id = await ctx.db.insert('prospects', {
      ...args,
      status: 'active',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    await logActivity(ctx, {
      type: 'create',
      actorUserId: userId,
      prospectId: id,
      message: `Bil "${args.title}" lades till`,
    })

    return id
  },
})

export const update = mutation({
  args: {
    id: v.id('prospects'),
    ...prospectFieldsValidator,
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const existing = await ctx.db.get(args.id)
    if (existing === null || existing.status === 'deleted') {
      throw new Error('Prospect not found')
    }

    const { id, ...fields } = args
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    })

    await logActivity(ctx, {
      type: 'update',
      actorUserId: userId,
      prospectId: id,
      message: `Bil "${fields.title}" uppdaterades`,
    })

    return id
  },
})

export const archive = mutation({
  args: { id: v.id('prospects') },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const existing = await ctx.db.get(args.id)
    if (existing === null || existing.status === 'deleted') {
      throw new Error('Prospect not found')
    }
    if (existing.status === 'archived') {
      return args.id
    }

    await ctx.db.patch(args.id, {
      status: 'archived',
      updatedAt: Date.now(),
    })

    await logActivity(ctx, {
      type: 'archive',
      actorUserId: userId,
      prospectId: args.id,
      message: `Bil "${existing.title}" arkiverades`,
    })

    return args.id
  },
})

export const remove = mutation({
  args: { id: v.id('prospects') },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const existing = await ctx.db.get(args.id)
    if (existing === null || existing.status === 'deleted') {
      throw new Error('Prospect not found')
    }
    if (existing.status !== 'archived') {
      throw new Error('Prospect must be archived before delete')
    }

    await ctx.db.patch(args.id, {
      status: 'deleted',
      updatedAt: Date.now(),
    })

    await logActivity(ctx, {
      type: 'delete',
      actorUserId: userId,
      prospectId: args.id,
      message: `Bil "${existing.title}" togs bort permanent`,
    })

    return args.id
  },
})

export const syncEquipment = mutation({
  args: {
    prospectId: v.id('prospects'),
    items: v.array(
      v.object({
        equipmentId: v.id('equipment'),
        isPresent: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    const prospect = await ctx.db.get(args.prospectId)
    if (prospect === null || prospect.status === 'deleted') {
      throw new Error('Prospect not found')
    }

    const existing = await ctx.db
      .query('prospectEquipment')
      .withIndex('by_prospectId', (q) => q.eq('prospectId', args.prospectId))
      .collect()

    for (const row of existing) {
      await ctx.db.delete(row._id)
    }

    for (const item of args.items) {
      await ctx.db.insert('prospectEquipment', {
        prospectId: args.prospectId,
        equipmentId: item.equipmentId,
        isPresent: item.isPresent,
      })
    }

    return args.prospectId
  },
})

export const listPurchaseItems = query({
  args: { prospectId: v.id('prospects') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db
      .query('purchaseItems')
      .withIndex('by_prospectId', (q) => q.eq('prospectId', args.prospectId))
      .collect()
  },
})

export const createPurchaseItem = mutation({
  args: {
    prospectId: v.id('prospects'),
    title: v.string(),
    costSek: v.number(),
    paidUpfront: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.insert('purchaseItems', args)
  },
})

export const removePurchaseItem = mutation({
  args: { id: v.id('purchaseItems') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.delete(args.id)
    return args.id
  },
})

export const listSourceLinks = query({
  args: { prospectId: v.id('prospects') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db
      .query('sourceLinks')
      .withIndex('by_prospectId', (q) => q.eq('prospectId', args.prospectId))
      .collect()
  },
})

export const createSourceLink = mutation({
  args: {
    prospectId: v.id('prospects'),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const id = await ctx.db.insert('sourceLinks', {
      ...args,
      createdBy: userId,
      createdAt: Date.now(),
    })

    await logActivity(ctx, {
      type: 'link',
      actorUserId: userId,
      prospectId: args.prospectId,
      entityId: id,
      message: `Länk "${args.title}" lades till`,
    })

    return id
  },
})

export const removeSourceLink = mutation({
  args: { id: v.id('sourceLinks') },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const link = await ctx.db.get(args.id)
    if (link === null) {
      throw new Error('Link not found')
    }

    await ctx.db.delete(args.id)

    await logActivity(ctx, {
      type: 'link',
      actorUserId: userId,
      prospectId: link.prospectId,
      entityId: args.id,
      message: `Länk "${link.title}" togs bort`,
    })

    return args.id
  },
})

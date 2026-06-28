import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { logActivity } from './lib/activity'
import { requireAuth } from './lib/auth'

export const listNotes = query({
  args: { prospectId: v.id('prospects') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db
      .query('notes')
      .withIndex('by_prospectId', (q) => q.eq('prospectId', args.prospectId))
      .collect()
  },
})

export const createNote = mutation({
  args: {
    prospectId: v.id('prospects'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const text = args.text.trim()
    if (text.length === 0) {
      throw new Error('Note text is required')
    }

    const now = Date.now()
    const id = await ctx.db.insert('notes', {
      prospectId: args.prospectId,
      userId,
      text,
      createdAt: now,
    })

    await logActivity(ctx, {
      type: 'note',
      actorUserId: userId,
      prospectId: args.prospectId,
      entityId: id,
      message: 'Anteckning lades till',
    })

    return id
  },
})

export const updateNote = mutation({
  args: {
    id: v.id('notes'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const note = await ctx.db.get(args.id)
    if (note === null) {
      throw new Error('Note not found')
    }
    if (note.userId !== userId) {
      throw new Error('Not allowed to edit this note')
    }

    const text = args.text.trim()
    if (text.length === 0) {
      throw new Error('Note text is required')
    }

    await ctx.db.patch(args.id, {
      text,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

export const removeNote = mutation({
  args: { id: v.id('notes') },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const note = await ctx.db.get(args.id)
    if (note === null) {
      throw new Error('Note not found')
    }
    if (note.userId !== userId) {
      throw new Error('Not allowed to delete this note')
    }

    await ctx.db.delete(args.id)

    await logActivity(ctx, {
      type: 'note',
      actorUserId: userId,
      prospectId: note.prospectId,
      entityId: args.id,
      message: 'Anteckning togs bort',
    })

    return args.id
  },
})

export const listRatings = query({
  args: { prospectId: v.id('prospects') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db
      .query('ratings')
      .withIndex('by_prospectId', (q) => q.eq('prospectId', args.prospectId))
      .collect()
  },
})

export const setRating = mutation({
  args: {
    prospectId: v.id('prospects'),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    if (args.score < 1 || args.score > 5 || !Number.isInteger(args.score)) {
      throw new Error('Rating must be an integer between 1 and 5')
    }

    const existing = await ctx.db
      .query('ratings')
      .withIndex('by_prospectId_userId', (q) =>
        q.eq('prospectId', args.prospectId).eq('userId', userId),
      )
      .unique()

    const now = Date.now()
    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        score: args.score,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('ratings', {
        prospectId: args.prospectId,
        userId,
        score: args.score,
        updatedAt: now,
      })
    }

    await logActivity(ctx, {
      type: 'rating',
      actorUserId: userId,
      prospectId: args.prospectId,
      message: `Betyg ${args.score}/5 sattes`,
      metadata: { score: args.score },
    })

    return args.prospectId
  },
})

export const listVetoes = query({
  args: { prospectId: v.id('prospects') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db
      .query('vetoes')
      .withIndex('by_prospectId', (q) => q.eq('prospectId', args.prospectId))
      .collect()
  },
})

export const toggleVeto = mutation({
  args: { prospectId: v.id('prospects') },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const existing = await ctx.db
      .query('vetoes')
      .withIndex('by_prospectId_userId', (q) =>
        q.eq('prospectId', args.prospectId).eq('userId', userId),
      )
      .unique()

    if (existing !== null) {
      await ctx.db.delete(existing._id)
      await logActivity(ctx, {
        type: 'veto',
        actorUserId: userId,
        prospectId: args.prospectId,
        message: 'Veto togs bort',
      })
      return { vetoed: false }
    }

    await ctx.db.insert('vetoes', {
      prospectId: args.prospectId,
      userId,
      createdAt: Date.now(),
    })

    await logActivity(ctx, {
      type: 'veto',
      actorUserId: userId,
      prospectId: args.prospectId,
      message: 'Veto sattes',
    })

    return { vetoed: true }
  },
})

export const listMyReminders = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx)
    return await ctx.db
      .query('reminders')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()
  },
})

export const toggleReminder = mutation({
  args: { prospectId: v.id('prospects') },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const existing = await ctx.db
      .query('reminders')
      .withIndex('by_prospectId_userId', (q) =>
        q.eq('prospectId', args.prospectId).eq('userId', userId),
      )
      .unique()

    if (existing !== null) {
      await ctx.db.delete(existing._id)
      await logActivity(ctx, {
        type: 'reminder',
        actorUserId: userId,
        prospectId: args.prospectId,
        message: 'Påminnelse togs bort',
      })
      return { reminded: false }
    }

    await ctx.db.insert('reminders', {
      prospectId: args.prospectId,
      userId,
      createdAt: Date.now(),
    })

    await logActivity(ctx, {
      type: 'reminder',
      actorUserId: userId,
      prospectId: args.prospectId,
      message: 'Påminnelse sattes',
    })

    return { reminded: true }
  },
})

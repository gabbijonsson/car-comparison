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
      metadata: { action: 'add' },
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
      metadata: { action: 'remove' },
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
        metadata: { action: 'remove' },
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
      metadata: { action: 'add' },
    })

    return { vetoed: true }
  },
})

export const summariesForProspects = query({
  args: { prospectIds: v.array(v.id('prospects')) },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const summaries = await Promise.all(
      args.prospectIds.map(async (prospectId) => {
        const [ratings, vetoes] = await Promise.all([
          ctx.db
            .query('ratings')
            .withIndex('by_prospectId', (q) => q.eq('prospectId', prospectId))
            .collect(),
          ctx.db
            .query('vetoes')
            .withIndex('by_prospectId', (q) => q.eq('prospectId', prospectId))
            .collect(),
        ])

        const ratingCount = ratings.length
        const avgScore =
          ratingCount > 0
            ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratingCount
            : null

        return {
          prospectId,
          avgScore,
          ratingCount,
          vetoCount: vetoes.length,
          hasVeto: vetoes.length > 0,
        }
      }),
    )

    return Object.fromEntries(summaries.map((row) => [row.prospectId, row]))
  },
})

export const ratingsAggregate = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx)
    const prospects = await ctx.db
      .query('prospects')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect()

    const rows = await Promise.all(
      prospects.map(async (prospect) => {
        const [ratings, vetoes] = await Promise.all([
          ctx.db
            .query('ratings')
            .withIndex('by_prospectId', (q) => q.eq('prospectId', prospect._id))
            .collect(),
          ctx.db
            .query('vetoes')
            .withIndex('by_prospectId', (q) => q.eq('prospectId', prospect._id))
            .collect(),
        ])

        const ratingCount = ratings.length
        const avgScore =
          ratingCount > 0
            ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratingCount
            : null

        return {
          prospectId: prospect._id,
          title: prospect.title,
          brand: prospect.brand,
          model: prospect.model,
          avgScore,
          ratingCount,
          vetoCount: vetoes.length,
          hasVeto: vetoes.length > 0,
        }
      }),
    )

    return rows.sort((a, b) => {
      if (a.hasVeto !== b.hasVeto) {
        return a.hasVeto ? 1 : -1
      }
      const avgA = a.avgScore ?? -1
      const avgB = b.avgScore ?? -1
      if (avgB !== avgA) {
        return avgB - avgA
      }
      return b.ratingCount - a.ratingCount
    })
  },
})

export const listMyReminders = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx)
    const reminders = await ctx.db
      .query('reminders')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()

    return Promise.all(
      reminders.map(async (reminder) => {
        const prospect = await ctx.db.get(reminder.prospectId)
        return {
          ...reminder,
          prospectTitle: prospect?.title ?? null,
          prospectStatus: prospect?.status ?? null,
        }
      }),
    )
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
        metadata: { action: 'remove' },
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
      metadata: { action: 'add' },
    })

    return { reminded: true }
  },
})

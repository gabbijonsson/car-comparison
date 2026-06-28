import { v } from 'convex/values'
import { query } from './_generated/server'
import { requireAuth } from './lib/auth'

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    const limit = args.limit ?? 10
    const events = await ctx.db
      .query('activityEvents')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit)
    return events
  },
})

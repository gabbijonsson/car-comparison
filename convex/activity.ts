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

    return Promise.all(
      events.map(async (event) => {
        const [actor, prospect] = await Promise.all([
          ctx.db.get(event.actorUserId),
          event.prospectId !== undefined ? ctx.db.get(event.prospectId) : Promise.resolve(null),
        ])

        return {
          ...event,
          actorName: actor?.name ?? actor?.email ?? null,
          prospectTitle: prospect?.title ?? null,
        }
      }),
    )
  },
})

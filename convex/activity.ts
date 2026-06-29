import { v } from 'convex/values'
import { query } from './_generated/server'
import { formatActivityMessage } from './lib/activityMessages'
import { requireAuth } from './lib/auth'
import { activityEventTypeValidator } from './lib/validators'

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(activityEventTypeValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    const limit = args.limit ?? 10
    const fetchLimit = args.type === undefined ? limit : Math.min(limit * 5, 100)
    const events = await ctx.db
      .query('activityEvents')
      .withIndex('by_createdAt')
      .order('desc')
      .take(fetchLimit)

    const filtered =
      args.type === undefined ? events : events.filter((event) => event.type === args.type)

    const rows = await Promise.all(
      filtered.slice(0, limit).map(async (event) => {
        const [actor, prospect] = await Promise.all([
          ctx.db.get(event.actorUserId),
          event.prospectId !== undefined ? ctx.db.get(event.prospectId) : Promise.resolve(null),
        ])

        const actorName = actor?.name ?? actor?.email ?? null
        const prospectTitle = prospect?.title ?? null

        return {
          ...event,
          actorName,
          prospectTitle,
          displayMessage: formatActivityMessage({
            type: event.type,
            actorName,
            prospectTitle,
            metadata: event.metadata,
            storedMessage: event.message,
          }),
        }
      }),
    )

    return rows
  },
})

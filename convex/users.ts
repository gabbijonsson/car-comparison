import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser, requireAuth } from './lib/auth'

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (user === null) {
      return null
    }
    return {
      _id: user._id,
      email: user.email ?? null,
      name: user.name ?? null,
      image: user.image ?? null,
      createdAt: user.createdAt ?? user._creationTime,
    }
  },
})

export const updateProfile = mutation({
  args: {
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx)
    const name = args.name.trim()
    if (name.length === 0) {
      throw new Error('Visningsnamn krävs')
    }
    await ctx.db.patch(userId, {
      name,
      ...(args.image !== undefined ? { image: args.image } : {}),
    })
    return userId
  },
})

import { createAccount } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { internalAction } from '../_generated/server'

export const create = internalAction({
  args: {
    adminSecret: v.string(),
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.USER_ADMIN_SECRET
    if (!expectedSecret || args.adminSecret !== expectedSecret) {
      throw new Error('Unauthorized')
    }

    const email = args.email.trim().toLowerCase()
    if (!email.includes('@')) {
      throw new Error('Invalid email')
    }

    const { user } = await createAccount(ctx, {
      provider: 'password',
      account: { id: email, secret: args.password },
      profile: {
        email,
        ...(args.name !== undefined ? { name: args.name.trim() } : {}),
      },
    })

    return { userId: user._id, email: user.email }
  },
})

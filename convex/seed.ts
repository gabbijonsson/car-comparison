import { internalMutation } from './_generated/server'
import { seedDefaults } from './lib/seedData'

export const seedDefaultsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query('users').first()
    if (user === null) {
      throw new Error('No users found — create a user before seeding')
    }
    return await seedDefaults(ctx, user._id)
  },
})

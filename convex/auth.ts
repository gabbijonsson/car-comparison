import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        if (params.flow === 'signUp') {
          throw new ConvexError('AUTH_SIGNUP_DISABLED')
        }
        return { email: params.email as string }
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (existingUserId === null) {
        await ctx.db.patch(userId, { createdAt: Date.now() })
      }
    },
  },
})

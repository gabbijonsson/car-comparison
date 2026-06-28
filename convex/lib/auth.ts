import { getAuthUserId } from '@convex-dev/auth/server'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type AuthCtx = QueryCtx | MutationCtx

export async function getCurrentUser(ctx: AuthCtx): Promise<Doc<'users'> | null> {
  const userId = await getAuthUserId(ctx)
  if (userId === null) {
    return null
  }
  return await ctx.db.get(userId)
}

export async function requireAuth(
  ctx: AuthCtx,
): Promise<{ userId: Id<'users'>; user: Doc<'users'> }> {
  const userId = await getAuthUserId(ctx)
  if (userId === null) {
    throw new Error('Not authenticated')
  }
  const user = await ctx.db.get(userId)
  if (user === null) {
    throw new Error('Not authenticated')
  }
  return { userId, user }
}

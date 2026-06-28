import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

type ActivityEventType =
  | 'create'
  | 'update'
  | 'archive'
  | 'delete'
  | 'note'
  | 'rating'
  | 'veto'
  | 'reminder'
  | 'link'
  | 'equipment'
  | 'settings'

export async function logActivity(
  ctx: MutationCtx,
  args: {
    type: ActivityEventType
    actorUserId: Id<'users'>
    prospectId?: Id<'prospects'>
    entityId?: string
    message: string
    metadata?: Record<string, string | number | boolean | null>
  },
): Promise<Id<'activityEvents'>> {
  return await ctx.db.insert('activityEvents', {
    type: args.type,
    actorUserId: args.actorUserId,
    prospectId: args.prospectId,
    entityId: args.entityId,
    message: args.message,
    metadata: args.metadata,
    createdAt: Date.now(),
  })
}

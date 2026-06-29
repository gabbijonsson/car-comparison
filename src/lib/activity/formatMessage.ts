import { type ActivityMessageContext, formatActivityMessage as formatMessage } from './messages'

export type ActivityEventLike = ActivityMessageContext

export function formatActivityMessage(event: ActivityEventLike): string {
  return formatMessage(event)
}

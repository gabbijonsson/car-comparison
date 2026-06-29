import { formatActivityMessage as formatMessage, type ActivityMessageContext } from './messages'

export type ActivityEventLike = ActivityMessageContext

export function formatActivityMessage(event: ActivityEventLike): string {
  return formatMessage(event)
}

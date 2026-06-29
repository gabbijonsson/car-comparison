import { z } from 'zod'
import { validationMessages as m } from './messages'
import { requiredTrimmedString, urlString } from './primitives'

export const sourceLinkSchema = z.object({
  clientKey: z.string(),
  title: requiredTrimmedString(m.linkTitleRequired),
  url: urlString,
  description: z.string().optional(),
})

export type SourceLinkInput = z.infer<typeof sourceLinkSchema>

export const sourceLinkPayloadSchema = sourceLinkSchema.omit({ clientKey: true })

export type SourceLinkPayload = z.infer<typeof sourceLinkPayloadSchema>

import type { z } from 'zod'
import type { engineTypeSchema, prospectStatusSchema, purchaseMethodSchema } from '~/lib/validation/enums'

export type EngineType = z.infer<typeof engineTypeSchema>
export type PurchaseMethod = z.infer<typeof purchaseMethodSchema>
export type ProspectStatus = z.infer<typeof prospectStatusSchema>

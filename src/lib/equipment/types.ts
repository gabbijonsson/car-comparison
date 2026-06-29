import type { z } from 'zod'
import type { equipmentCategorySchema, equipmentPrioritySchema } from '~/lib/validation/enums'

export type EquipmentCategory = z.infer<typeof equipmentCategorySchema>
export type EquipmentPriority = z.infer<typeof equipmentPrioritySchema>

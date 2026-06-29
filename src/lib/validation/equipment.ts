import { z } from 'zod'
import { equipmentCategorySchema, equipmentPrioritySchema } from './enums'
import { validationMessages as m } from './messages'
import { requiredTrimmedString } from './primitives'

export const equipmentFormSchema = z.object({
  name: requiredTrimmedString(m.nameRequired),
  category: equipmentCategorySchema,
  priority: equipmentPrioritySchema,
})

export type EquipmentFormInput = z.infer<typeof equipmentFormSchema>

import { z } from 'zod'
import { equipmentCategorySchema, equipmentPrioritySchema } from './enums'

export const equipmentFormSchema = z.object({
  name: z.string().trim().min(1, 'Namn krävs'),
  category: equipmentCategorySchema,
  priority: equipmentPrioritySchema,
})

export type EquipmentFormInput = z.infer<typeof equipmentFormSchema>

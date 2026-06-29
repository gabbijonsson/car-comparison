import { z } from 'zod'

export const equipmentCategorySchema = z.enum([
  'safety',
  'comfort',
  'winter',
  'audio',
  'driver_assistance',
  'practical',
  'performance',
  'charging_electric',
  'other',
])

export const equipmentPrioritySchema = z.enum(['must', 'nice', 'neutral'])

export const prospectStatusSchema = z.enum(['active', 'archived', 'deleted'])

export const engineTypeSchema = z.enum(['petrol', 'diesel', 'electric', 'hybrid'])

export const purchaseMethodSchema = z.enum(['cash', 'financed'])

export const activityEventTypeSchema = z.enum([
  'create',
  'update',
  'archive',
  'delete',
  'note',
  'rating',
  'veto',
  'reminder',
  'link',
  'equipment',
  'settings',
])

export type ActivityEventType = z.infer<typeof activityEventTypeSchema>

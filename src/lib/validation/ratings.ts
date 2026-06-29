import { z } from 'zod'
import { validationMessages as m } from './messages'

export const ratingScoreSchema = z.number().int().min(1, m.ratingRange).max(5, m.ratingRange)

export type RatingScore = z.infer<typeof ratingScoreSchema>

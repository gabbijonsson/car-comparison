import { z } from 'zod'
import { validationMessages as m } from './messages'

export const requiredTrimmedString = (message: string) => z.string().trim().min(1, message)

export const nonnegativeNumber = z.number().nonnegative(m.nonnegative)

export const positiveNumber = z.number().positive(m.positive)

export const positiveInt = z.number().int().positive(m.positive)

export const optionalYear = z
  .number()
  .int()
  .min(1900, m.yearRange)
  .max(2100, m.yearRange)
  .optional()

export const optionalNonnegative = z.number().nonnegative(m.nonnegative).optional()

export const urlString = requiredTrimmedString(m.urlRequired).pipe(z.url({ error: m.invalidUrl }))

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

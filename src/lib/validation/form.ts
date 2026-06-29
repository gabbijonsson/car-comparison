import type { ZodError } from 'zod'
import { sv } from '~/lib/i18n/sv'
import { validationMessages as m } from './messages'

export function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) {
    return undefined
  }
  return errors.map((error) => String(error)).join(', ')
}

export function firstZodIssue(error: ZodError): string {
  return error.issues[0]?.message ?? sv.common.saveError
}

export function nonnegativeFieldValidator(value: number): string | undefined {
  if (value < 0) {
    return m.nonnegative
  }
  return undefined
}

export function positiveFieldValidator(value: number): string | undefined {
  if (value <= 0) {
    return m.positive
  }
  return undefined
}

export function positiveIntFieldValidator(value: number): string | undefined {
  if (!Number.isInteger(value) || value <= 0) {
    return m.positive
  }
  return undefined
}

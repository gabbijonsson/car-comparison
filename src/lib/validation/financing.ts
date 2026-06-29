import { z } from 'zod'
import { validationMessages as m } from './messages'
import { nonnegativeNumber, positiveInt } from './primitives'

export const financingSchema = z.object({
  downPaymentSek: z.number().nonnegative(m.nonnegative).optional(),
  monthlyPayment: nonnegativeNumber,
  interestRate: nonnegativeNumber,
  monthlyAdminFee: nonnegativeNumber,
  yearlyFee: z.number().nonnegative(m.nonnegative).optional(),
  periodMonths: positiveInt,
  restValueSek: nonnegativeNumber,
  useAutoCalc: z.boolean(),
})

export type FinancingInput = z.infer<typeof financingSchema>

export function periodMonthsFieldValidator(value: number): string | undefined {
  if (!Number.isInteger(value) || value <= 0) {
    return m.periodMonthsPositive
  }
  return undefined
}

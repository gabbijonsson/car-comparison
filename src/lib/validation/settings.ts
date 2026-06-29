import { z } from 'zod'
import { validationMessages as m } from './messages'
import { positiveInt, positiveNumber } from './primitives'

export const globalSettingsSchema = z.object({
  annualKm: positiveNumber,
  petrolPriceSekPerLiter: positiveNumber,
  dieselPriceSekPerLiter: positiveNumber,
  kwhPriceSekPerKwh: positiveNumber,
  hybridFuelPercent: z.number().min(0, m.percentRange).max(100, m.percentRange),
  hybridLitersPerMil: positiveNumber,
  hybridKwhPerMil: positiveNumber,
  ownershipMonths: positiveInt,
})

export type GlobalSettingsInput = z.infer<typeof globalSettingsSchema>

export function annualKmFieldValidator(value: number): string | undefined {
  if (value <= 0) {
    return m.annualKmPositive
  }
  return undefined
}

export function petrolPriceFieldValidator(value: number): string | undefined {
  if (value <= 0) {
    return m.petrolPricePositive
  }
  return undefined
}

export function dieselPriceFieldValidator(value: number): string | undefined {
  if (value <= 0) {
    return m.dieselPricePositive
  }
  return undefined
}

export function kwhPriceFieldValidator(value: number): string | undefined {
  if (value <= 0) {
    return m.kwhPricePositive
  }
  return undefined
}

export function hybridFuelPercentFieldValidator(value: number): string | undefined {
  if (value < 0 || value > 100) {
    return m.hybridFuelPercentRange
  }
  return undefined
}

export function hybridLitersFieldValidator(value: number): string | undefined {
  if (value <= 0) {
    return m.hybridLitersPositive
  }
  return undefined
}

export function hybridKwhFieldValidator(value: number): string | undefined {
  if (value <= 0) {
    return m.hybridKwhPositive
  }
  return undefined
}

export function ownershipMonthsFieldValidator(value: number): string | undefined {
  if (!Number.isInteger(value) || value <= 0) {
    return m.ownershipMonthsPositive
  }
  return undefined
}

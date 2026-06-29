import { describe, expect, it } from 'vitest'
import { equipmentFormSchema } from './equipment'
import { financingSchema } from './financing'
import { sourceLinkSchema } from './links'
import { validationMessages as m } from './messages'
import { noteTextSchema } from './notes'
import { prospectFormSchema } from './prospect'
import { ratingScoreSchema } from './ratings'
import { globalSettingsSchema } from './settings'

describe('prospectFormSchema', () => {
  const base = {
    brand: 'Volvo',
    model: 'XC60',
    title: 'Fin bil',
    engineType: 'petrol' as const,
    purchaseMethod: 'cash' as const,
    buyPriceSek: 400_000,
    insuranceMonthlySek: 800,
    taxYearlySek: 1200,
    serviceSmallSek: 3000,
    serviceBigSek: 6000,
    serviceIntervalMonths: 12,
    fuelConsumption: 0.8,
    freeTextTagsInput: '',
    equipment: [],
    purchaseItems: [],
    sourceLinks: [],
  }

  it('rejects negative insurance with Swedish message', () => {
    const result = prospectFormSchema.safeParse({
      ...base,
      insuranceMonthlySek: -1,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === m.nonnegative)).toBe(true)
    }
  })

  it('requires fuel consumption for non-hybrid engines', () => {
    const result = prospectFormSchema.safeParse({
      ...base,
      fuelConsumption: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === m.consumptionRequired)).toBe(
        true,
      )
    }
  })
})

describe('sourceLinkSchema', () => {
  it('rejects invalid URLs in Swedish', () => {
    const result = sourceLinkSchema.safeParse({
      clientKey: '1',
      title: 'Annons',
      url: 'inte-en-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(m.invalidUrl)
    }
  })

  it('accepts https URLs', () => {
    const result = sourceLinkSchema.safeParse({
      clientKey: '1',
      title: 'Annons',
      url: 'https://example.com/car',
    })
    expect(result.success).toBe(true)
  })
})

describe('globalSettingsSchema', () => {
  it('rejects non-positive petrol price', () => {
    const result = globalSettingsSchema.safeParse({
      annualKm: 15_000,
      petrolPriceSekPerLiter: 0,
      dieselPriceSekPerLiter: 18,
      kwhPriceSekPerKwh: 2,
      hybridFuelPercent: 50,
      hybridLitersPerMil: 0.5,
      hybridKwhPerMil: 2,
      ownershipMonths: 120,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === m.positive)).toBe(true)
    }
  })
})

describe('equipmentFormSchema', () => {
  it('requires name in Swedish', () => {
    const result = equipmentFormSchema.safeParse({
      name: '   ',
      category: 'other',
      priority: 'neutral',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(m.nameRequired)
    }
  })
})

describe('financingSchema', () => {
  it('requires positive period months', () => {
    const result = financingSchema.safeParse({
      monthlyPayment: 3000,
      interestRate: 4,
      monthlyAdminFee: 60,
      periodMonths: 0,
      restValueSek: 100_000,
      useAutoCalc: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === m.positive)).toBe(true)
    }
  })
})

describe('ratingScoreSchema', () => {
  it('rejects out-of-range scores in Swedish', () => {
    const result = ratingScoreSchema.safeParse(6)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(m.ratingRange)
    }
  })
})

describe('noteTextSchema', () => {
  it('rejects empty notes in Swedish', () => {
    const result = noteTextSchema.safeParse('   ')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(m.noteRequired)
    }
  })
})

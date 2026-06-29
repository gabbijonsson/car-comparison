import { v } from 'convex/values'

export const equipmentCategoryValidator = v.union(
  v.literal('safety'),
  v.literal('comfort'),
  v.literal('winter'),
  v.literal('audio'),
  v.literal('driver_assistance'),
  v.literal('practical'),
  v.literal('performance'),
  v.literal('charging_electric'),
  v.literal('other'),
)

export const equipmentPriorityValidator = v.union(
  v.literal('must'),
  v.literal('nice'),
  v.literal('neutral'),
)

export const prospectStatusValidator = v.union(
  v.literal('active'),
  v.literal('archived'),
  v.literal('deleted'),
)

export const engineTypeValidator = v.union(
  v.literal('petrol'),
  v.literal('diesel'),
  v.literal('electric'),
  v.literal('hybrid'),
)

export const purchaseMethodValidator = v.union(v.literal('cash'), v.literal('financed'))

export const activityEventTypeValidator = v.union(
  v.literal('create'),
  v.literal('update'),
  v.literal('archive'),
  v.literal('delete'),
  v.literal('note'),
  v.literal('rating'),
  v.literal('veto'),
  v.literal('reminder'),
  v.literal('link'),
  v.literal('equipment'),
  v.literal('settings'),
)

export const financingValidator = v.object({
  downPaymentSek: v.optional(v.number()),
  monthlyPayment: v.number(),
  interestRate: v.number(),
  monthlyAdminFee: v.number(),
  yearlyFee: v.optional(v.number()),
  periodMonths: v.number(),
  restValueSek: v.number(),
  useAutoCalc: v.boolean(),
})

export const globalSettingsFieldsValidator = {
  annualKm: v.number(),
  petrolPriceSekPerLiter: v.number(),
  dieselPriceSekPerLiter: v.number(),
  kwhPriceSekPerKwh: v.number(),
  hybridFuelPercent: v.number(),
  hybridLitersPerMil: v.number(),
  hybridKwhPerMil: v.number(),
  ownershipMonths: v.number(),
}

export type GlobalSettingsFields = {
  annualKm: number
  petrolPriceSekPerLiter: number
  dieselPriceSekPerLiter: number
  kwhPriceSekPerKwh: number
  hybridFuelPercent: number
  hybridLitersPerMil: number
  hybridKwhPerMil: number
  ownershipMonths: number
}

export function assertValidGlobalSettings(fields: GlobalSettingsFields): void {
  if (fields.annualKm <= 0) {
    throw new Error('Årlig körsträcka måste vara större än 0')
  }
  if (fields.petrolPriceSekPerLiter <= 0) {
    throw new Error('Bensinpris måste vara större än 0')
  }
  if (fields.dieselPriceSekPerLiter <= 0) {
    throw new Error('Dieselpris måste vara större än 0')
  }
  if (fields.kwhPriceSekPerKwh <= 0) {
    throw new Error('Elpris måste vara större än 0')
  }
  if (fields.hybridFuelPercent < 0 || fields.hybridFuelPercent > 100) {
    throw new Error('Hybrid bränsleandel måste vara mellan 0 och 100')
  }
  if (fields.hybridLitersPerMil <= 0) {
    throw new Error('Hybrid förbrukning (L/mil) måste vara större än 0')
  }
  if (fields.hybridKwhPerMil <= 0) {
    throw new Error('Hybrid förbrukning (kWh/mil) måste vara större än 0')
  }
  if (!Number.isInteger(fields.ownershipMonths) || fields.ownershipMonths <= 0) {
    throw new Error('Ägandeperiod måste vara ett positivt heltal')
  }
}

export function assertValidUrl(url: string): void {
  try {
    const parsed = new URL(url.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Ogiltig URL')
    }
  } catch {
    throw new Error('Ogiltig URL')
  }
}

export const ratingScoreValidator = v.number()

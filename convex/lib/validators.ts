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

export const ratingScoreValidator = v.number()

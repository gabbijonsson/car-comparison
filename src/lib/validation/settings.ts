import { z } from 'zod'

export const globalSettingsSchema = z.object({
  annualKm: z.number().positive(),
  petrolPriceSekPerLiter: z.number().positive(),
  dieselPriceSekPerLiter: z.number().positive(),
  kwhPriceSekPerKwh: z.number().positive(),
  hybridFuelPercent: z.number().min(0).max(100),
  hybridLitersPerMil: z.number().positive(),
  hybridKwhPerMil: z.number().positive(),
  ownershipMonths: z.number().int().positive(),
})

export type GlobalSettingsInput = z.infer<typeof globalSettingsSchema>

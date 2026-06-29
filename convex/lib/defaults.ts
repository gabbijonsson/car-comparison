import type { Id } from '../_generated/dataModel'

export const GLOBAL_SETTINGS_KEY = 'default' as const

export const DEFAULT_GLOBAL_SETTINGS = {
  key: GLOBAL_SETTINGS_KEY,
  annualKm: 15_000,
  petrolPriceSekPerLiter: 18,
  dieselPriceSekPerLiter: 20,
  kwhPriceSekPerKwh: 2.5,
  hybridFuelPercent: 50,
  hybridLitersPerMil: 0.5,
  hybridKwhPerMil: 2,
  ownershipMonths: 120,
} as const

export const GLOBAL_SETTINGS_FIELD_DEFAULTS = {
  annualKm: DEFAULT_GLOBAL_SETTINGS.annualKm,
  petrolPriceSekPerLiter: DEFAULT_GLOBAL_SETTINGS.petrolPriceSekPerLiter,
  dieselPriceSekPerLiter: DEFAULT_GLOBAL_SETTINGS.dieselPriceSekPerLiter,
  kwhPriceSekPerKwh: DEFAULT_GLOBAL_SETTINGS.kwhPriceSekPerKwh,
  hybridFuelPercent: DEFAULT_GLOBAL_SETTINGS.hybridFuelPercent,
  hybridLitersPerMil: DEFAULT_GLOBAL_SETTINGS.hybridLitersPerMil,
  hybridKwhPerMil: DEFAULT_GLOBAL_SETTINGS.hybridKwhPerMil,
  ownershipMonths: DEFAULT_GLOBAL_SETTINGS.ownershipMonths,
} as const

export type DefaultEquipmentSeed = {
  name: string
  category:
    | 'safety'
    | 'comfort'
    | 'winter'
    | 'audio'
    | 'driver_assistance'
    | 'practical'
    | 'performance'
    | 'charging_electric'
    | 'other'
  priority: 'must' | 'nice' | 'neutral'
}

export const DEFAULT_EQUIPMENT: DefaultEquipmentSeed[] = [
  { name: 'Adaptiv farthållare', category: 'driver_assistance', priority: 'must' },
  { name: 'Backkamera', category: 'safety', priority: 'must' },
  { name: 'Dragkrok', category: 'practical', priority: 'nice' },
  { name: 'Panoramatak', category: 'comfort', priority: 'nice' },
  { name: 'Vinterdäck', category: 'winter', priority: 'must' },
  { name: 'Apple CarPlay', category: 'audio', priority: 'nice' },
  { name: 'Elstol med minne', category: 'comfort', priority: 'neutral' },
  { name: 'ACC-laddning', category: 'charging_electric', priority: 'must' },
  { name: 'Sportpaket', category: 'performance', priority: 'neutral' },
  { name: 'ISOFIX bak', category: 'safety', priority: 'must' },
]

export type SeedActor = {
  userId: Id<'users'>
}

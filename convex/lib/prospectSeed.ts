import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

type ProspectSeed = {
  brand: string
  model: string
  title: string
  modelYear?: number
  registrationYear?: number
  mileage?: number
  engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  purchaseMethod: 'cash' | 'financed'
  buyPriceSek: number
  packageDescription?: string
  insuranceMonthlySek: number
  taxYearlySek: number
  serviceSmallSek: number
  serviceBigSek: number
  serviceIntervalMonths: number
  fuelConsumption?: number
  financing?: {
    downPaymentSek?: number
    monthlyPayment: number
    interestRate: number
    monthlyAdminFee: number
    yearlyFee?: number
    periodMonths: number
    restValueSek: number
    useAutoCalc: boolean
  }
  freeTextEquipmentTags: string[]
  purchaseItems: Array<{ title: string; costSek: number; paidUpfront: boolean }>
  equipmentNames: Array<{ name: string; isPresent: boolean }>
}

export const DEFAULT_PROSPECTS: ProspectSeed[] = [
  {
    brand: 'Volvo',
    model: 'XC60',
    title: 'Volvo XC60 B5 Momentum',
    modelYear: 2022,
    registrationYear: 2022,
    mileage: 45_000,
    engineType: 'petrol',
    purchaseMethod: 'cash',
    buyPriceSek: 389_000,
    packageDescription: 'Momentum, värmare, dragkrok',
    insuranceMonthlySek: 920,
    taxYearlySek: 3600,
    serviceSmallSek: 4500,
    serviceBigSek: 9000,
    serviceIntervalMonths: 12,
    fuelConsumption: 0.75,
    freeTextEquipmentTags: ['Panoramatak'],
    purchaseItems: [{ title: 'Vinterdäck + fälgar', costSek: 12_000, paidUpfront: true }],
    equipmentNames: [
      { name: 'Adaptiv farthållare', isPresent: true },
      { name: 'Backkamera', isPresent: true },
      { name: 'Vinterdäck', isPresent: true },
      { name: 'Dragkrok', isPresent: false },
    ],
  },
  {
    brand: 'BMW',
    model: '320d',
    title: 'BMW 320d xDrive Touring',
    modelYear: 2021,
    registrationYear: 2021,
    mileage: 62_000,
    engineType: 'diesel',
    purchaseMethod: 'financed',
    buyPriceSek: 329_000,
    insuranceMonthlySek: 1050,
    taxYearlySek: 4800,
    serviceSmallSek: 5500,
    serviceBigSek: 11_000,
    serviceIntervalMonths: 12,
    fuelConsumption: 0.55,
    financing: {
      downPaymentSek: 65_000,
      monthlyPayment: 4534,
      interestRate: 6,
      monthlyAdminFee: 95,
      yearlyFee: 600,
      periodMonths: 36,
      restValueSek: 180_000,
      useAutoCalc: false,
    },
    freeTextEquipmentTags: [],
    purchaseItems: [{ title: 'Serviceavtal första året', costSek: 8500, paidUpfront: true }],
    equipmentNames: [
      { name: 'Apple CarPlay', isPresent: true },
      { name: 'Dragkrok', isPresent: true },
      { name: 'ISOFIX bak', isPresent: true },
    ],
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    title: 'Tesla Model 3 Long Range',
    modelYear: 2023,
    registrationYear: 2023,
    mileage: 28_000,
    engineType: 'electric',
    purchaseMethod: 'cash',
    buyPriceSek: 425_000,
    insuranceMonthlySek: 780,
    taxYearlySek: 360,
    serviceSmallSek: 0,
    serviceBigSek: 0,
    serviceIntervalMonths: 24,
    fuelConsumption: 1.6,
    freeTextEquipmentTags: ['HW4', 'Vit interiör'],
    purchaseItems: [],
    equipmentNames: [
      { name: 'ACC-laddning', isPresent: true },
      { name: 'Adaptiv farthållare', isPresent: true },
    ],
  },
  {
    brand: 'Toyota',
    model: 'RAV4',
    title: 'Toyota RAV4 Hybrid AWD-i',
    modelYear: 2020,
    registrationYear: 2020,
    mileage: 78_000,
    engineType: 'hybrid',
    purchaseMethod: 'financed',
    buyPriceSek: 279_000,
    insuranceMonthlySek: 890,
    taxYearlySek: 3600,
    serviceSmallSek: 4000,
    serviceBigSek: 8000,
    serviceIntervalMonths: 12,
    financing: {
      downPaymentSek: 40_000,
      monthlyPayment: 5200,
      interestRate: 4.9,
      monthlyAdminFee: 55,
      periodMonths: 48,
      restValueSek: 120_000,
      useAutoCalc: false,
    },
    freeTextEquipmentTags: [],
    purchaseItems: [
      { title: 'Golfbagage', costSek: 3500, paidUpfront: false },
      { title: 'Mudflaps', costSek: 1200, paidUpfront: true },
    ],
    equipmentNames: [
      { name: 'Backkamera', isPresent: true },
      { name: 'Vinterdäck', isPresent: false },
    ],
  },
]

export async function seedProspects(ctx: MutationCtx, actorUserId: Id<'users'>): Promise<number> {
  const equipmentRows = await ctx.db.query('equipment').collect()
  const equipmentByName = new Map(equipmentRows.map((row) => [row.name, row._id]))
  const existingProspects = await ctx.db
    .query('prospects')
    .withIndex('by_status', (q) => q.eq('status', 'active'))
    .collect()
  const existingTitles = new Set(existingProspects.map((row) => row.title))

  const now = Date.now()
  let seeded = 0

  for (const seed of DEFAULT_PROSPECTS) {
    if (existingTitles.has(seed.title)) {
      continue
    }

    const prospectId = await ctx.db.insert('prospects', {
      brand: seed.brand,
      model: seed.model,
      title: seed.title,
      modelYear: seed.modelYear,
      registrationYear: seed.registrationYear,
      mileage: seed.mileage,
      engineType: seed.engineType,
      purchaseMethod: seed.purchaseMethod,
      buyPriceSek: seed.buyPriceSek,
      packageDescription: seed.packageDescription,
      insuranceMonthlySek: seed.insuranceMonthlySek,
      taxYearlySek: seed.taxYearlySek,
      serviceSmallSek: seed.serviceSmallSek,
      serviceBigSek: seed.serviceBigSek,
      serviceIntervalMonths: seed.serviceIntervalMonths,
      fuelConsumption: seed.fuelConsumption,
      financing: seed.financing,
      freeTextEquipmentTags: seed.freeTextEquipmentTags,
      status: 'active',
      createdBy: actorUserId,
      createdAt: now,
      updatedAt: now,
    })

    for (const item of seed.purchaseItems) {
      await ctx.db.insert('purchaseItems', {
        prospectId,
        title: item.title,
        costSek: item.costSek,
        paidUpfront: item.paidUpfront,
      })
    }

    for (const link of seed.equipmentNames) {
      const equipmentId = equipmentByName.get(link.name)
      if (equipmentId !== undefined) {
        await ctx.db.insert('prospectEquipment', {
          prospectId,
          equipmentId,
          isPresent: link.isPresent,
        })
      }
    }

    seeded++
  }

  return seeded
}

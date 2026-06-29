import { describe, expect, it } from 'vitest'
import { calculateMonthlyPayment } from '~/lib/finance/amortization'
import {
  buildMonthlySchedule,
  type CompletionItemInput,
  computeEnergyMonthly,
  computeServiceEvents,
  type GlobalSettingsInput,
  type ProspectCostInput,
} from './index'

const SETTINGS: GlobalSettingsInput = {
  annualKm: 15_000,
  petrolPriceSekPerLiter: 18,
  dieselPriceSekPerLiter: 20,
  kwhPriceSekPerKwh: 2.5,
  hybridFuelPercent: 50,
  hybridLitersPerMil: 0.5,
  hybridKwhPerMil: 2,
  ownershipMonths: 120,
}

function baseProspect(overrides: Partial<ProspectCostInput> = {}): ProspectCostInput {
  return {
    engineType: 'petrol',
    purchaseMethod: 'cash',
    buyPriceSek: 400_000,
    insuranceMonthlySek: 0,
    taxYearlySek: 0,
    serviceSmallSek: 0,
    serviceBigSek: 0,
    serviceIntervalMonths: 12,
    fuelConsumption: 0.8,
    ...overrides,
  }
}

function items(...entries: CompletionItemInput[]): CompletionItemInput[] {
  return entries
}

function monthTotal(projection: ReturnType<typeof buildMonthlySchedule>, month: number): number {
  return projection.months[month]?.monthTotalSek ?? 0
}

function categoryAtMonth(
  projection: ReturnType<typeof buildMonthlySchedule>,
  month: number,
  category: string,
): number {
  return (
    projection.months[month]?.items
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amountSek, 0) ?? 0
  )
}

describe('computeEnergyMonthly', () => {
  it('case 10: petrol energy from consumption and global prices', () => {
    // 15000 km/yr → 1250 km/mo → 125 mil/mo × 0.8 L/mil × 18 kr/L = 1800
    expect(computeEnergyMonthly(baseProspect(), SETTINGS)).toBe(1800)
  })

  it('case 11: electric energy from kWh/mil', () => {
    // 125 mil × 2 kWh/mil × 2.5 kr = 625
    expect(
      computeEnergyMonthly(baseProspect({ engineType: 'electric', fuelConsumption: 2 }), SETTINGS),
    ).toBe(625)
  })

  it('case 12: hybrid uses global assumptions only', () => {
    const withConsumption = computeEnergyMonthly(
      baseProspect({ engineType: 'hybrid', fuelConsumption: 99 }),
      SETTINGS,
    )
    const withoutConsumption = computeEnergyMonthly(
      baseProspect({ engineType: 'hybrid', fuelConsumption: undefined }),
      SETTINGS,
    )
    expect(withConsumption).toBe(withoutConsumption)
    expect(withConsumption).toBe(875)
  })
})

describe('computeServiceEvents', () => {
  it('case 9: alternates small/big from month interval-1', () => {
    const events = computeServiceEvents(12, 3000, 6000, 120)
    expect(events.get(11)).toBe(3000)
    expect(events.get(23)).toBe(6000)
    expect(events.get(35)).toBe(3000)
    expect(events.get(47)).toBe(6000)
    expect(events.has(10)).toBe(false)
  })
})

describe('buildMonthlySchedule', () => {
  it('case 1: cash month 0 spike is buy price plus energy only', () => {
    const projection = buildMonthlySchedule(baseProspect(), SETTINGS, [])
    expect(categoryAtMonth(projection, 0, 'purchase')).toBe(400_000)
    expect(categoryAtMonth(projection, 0, 'completionItems')).toBe(0)
    expect(monthTotal(projection, 0)).toBe(401_800)
    expect(monthTotal(projection, 1)).toBe(1800)
  })

  it('case 2: cash adds upfront completion items at month 0', () => {
    const projection = buildMonthlySchedule(
      baseProspect({ buyPriceSek: 300_000 }),
      SETTINGS,
      items({ title: 'Vinterdäck', costSek: 15_000, paidUpfront: true }),
    )
    expect(categoryAtMonth(projection, 0, 'purchase')).toBe(300_000)
    expect(categoryAtMonth(projection, 0, 'completionItems')).toBe(15_000)
    expect(monthTotal(projection, 0)).toBe(316_800)
  })

  it('case 3: financed month 0 is handpenning plus upfront items, not buy price', () => {
    const projection = buildMonthlySchedule(
      baseProspect({
        purchaseMethod: 'financed',
        buyPriceSek: 500_000,
        fuelConsumption: undefined,
        financing: {
          downPaymentSek: 100_000,
          monthlyPayment: 8000,
          interestRate: 5,
          monthlyAdminFee: 0,
          periodMonths: 36,
          restValueSek: 0,
          useAutoCalc: false,
        },
      }),
      SETTINGS,
      items({ title: 'Dragkrok', costSek: 8000, paidUpfront: true }),
    )
    expect(categoryAtMonth(projection, 0, 'purchase')).toBe(100_000)
    expect(categoryAtMonth(projection, 0, 'completionItems')).toBe(8000)
    expect(categoryAtMonth(projection, 0, 'financingPayment')).toBe(8000)
    expect(monthTotal(projection, 0)).toBe(116_000)
  })

  it('case 4: financed monthly payment and admin fee each month of term', () => {
    const projection = buildMonthlySchedule(
      baseProspect({
        purchaseMethod: 'financed',
        fuelConsumption: undefined,
        financing: {
          monthlyPayment: 5500,
          interestRate: 4,
          monthlyAdminFee: 95,
          periodMonths: 48,
          restValueSek: 0,
          useAutoCalc: false,
        },
      }),
      { ...SETTINGS, ownershipMonths: 60 },
      [],
    )
    expect(categoryAtMonth(projection, 10, 'financingPayment')).toBe(5500)
    expect(categoryAtMonth(projection, 10, 'financingFees')).toBe(95)
    expect(categoryAtMonth(projection, 47, 'financingPayment')).toBe(5500)
    expect(categoryAtMonth(projection, 48, 'financingPayment')).toBe(0)
  })

  it('case 5: balloon at last month of finance period', () => {
    const projection = buildMonthlySchedule(
      baseProspect({
        purchaseMethod: 'financed',
        fuelConsumption: undefined,
        financing: {
          monthlyPayment: 4500,
          interestRate: 6,
          monthlyAdminFee: 0,
          periodMonths: 36,
          restValueSek: 280_000,
          useAutoCalc: false,
        },
      }),
      SETTINGS,
      [],
    )
    expect(categoryAtMonth(projection, 35, 'balloon')).toBe(280_000)
    expect(categoryAtMonth(projection, 34, 'balloon')).toBe(0)
  })

  it('case 6: tax on calendar-month cadence (months 11, 23, …)', () => {
    const projection = buildMonthlySchedule(
      baseProspect({ taxYearlySek: 3600, fuelConsumption: undefined }),
      SETTINGS,
      [],
    )
    expect(categoryAtMonth(projection, 10, 'tax')).toBe(0)
    expect(categoryAtMonth(projection, 11, 'tax')).toBe(3600)
    expect(categoryAtMonth(projection, 23, 'tax')).toBe(3600)
    expect(categoryAtMonth(projection, 119, 'tax')).toBe(3600)
    expect(projection.byCategory.tax).toBe(3600 * 10)
  })

  it('case 7: yearly finance fee on same calendar cadence as tax', () => {
    const projection = buildMonthlySchedule(
      baseProspect({
        purchaseMethod: 'financed',
        fuelConsumption: undefined,
        financing: {
          monthlyPayment: 4000,
          interestRate: 3,
          monthlyAdminFee: 0,
          yearlyFee: 600,
          periodMonths: 60,
          restValueSek: 0,
          useAutoCalc: false,
        },
      }),
      SETTINGS,
      [],
    )
    expect(categoryAtMonth(projection, 11, 'financingFees')).toBe(600)
    expect(categoryAtMonth(projection, 23, 'financingFees')).toBe(600)
    expect(categoryAtMonth(projection, 10, 'financingFees')).toBe(0)
  })

  it('case 8: insurance every month', () => {
    const projection = buildMonthlySchedule(
      baseProspect({ insuranceMonthlySek: 850, fuelConsumption: undefined }),
      SETTINGS,
      [],
    )
    expect(categoryAtMonth(projection, 0, 'insurance')).toBe(850)
    expect(categoryAtMonth(projection, 59, 'insurance')).toBe(850)
    expect(projection.byCategory.insurance).toBe(850 * 120)
  })

  it('handpenning: month 0 purchase lower than buy price; loan payment from reduced principal', () => {
    const buyPriceSek = 600_000
    const downPaymentSek = 120_000
    const monthlyPayment = calculateMonthlyPayment({
      principal: buyPriceSek - downPaymentSek,
      annualRate: 5.5,
      months: 36,
      balloon: 350_000,
    })

    const projection = buildMonthlySchedule(
      baseProspect({
        purchaseMethod: 'financed',
        buyPriceSek,
        fuelConsumption: undefined,
        financing: {
          downPaymentSek,
          monthlyPayment,
          interestRate: 5.5,
          monthlyAdminFee: 55,
          periodMonths: 36,
          restValueSek: 350_000,
          useAutoCalc: true,
        },
      }),
      SETTINGS,
      [],
    )

    expect(categoryAtMonth(projection, 0, 'purchase')).toBe(120_000)
    expect(categoryAtMonth(projection, 0, 'purchase')).not.toBe(buyPriceSek)
    expect(categoryAtMonth(projection, 0, 'financingPayment')).toBe(monthlyPayment)
    expect(categoryAtMonth(projection, 35, 'balloon')).toBe(350_000)
    expect(monthlyPayment).toBe(5530)
  })

  it('aggregates 36/60/120 month cumulative totals', () => {
    const projection = buildMonthlySchedule(
      baseProspect({ insuranceMonthlySek: 1000, fuelConsumption: undefined }),
      SETTINGS,
      [],
    )
    expect(projection.totals.months36).toBe(projection.months[35]?.cumulativeSek)
    expect(projection.totals.months60).toBe(projection.months[59]?.cumulativeSek)
    expect(projection.totals.months120).toBe(projection.months[119]?.cumulativeSek)
  })

  it('ignores non-upfront completion items in schedule', () => {
    const projection = buildMonthlySchedule(
      baseProspect(),
      SETTINGS,
      items({ title: 'Senare', costSek: 20_000, paidUpfront: false }),
    )
    expect(projection.byCategory.completionItems).toBe(0)
  })

  it('edge: zero rest value and zero interest financed loan', () => {
    const projection = buildMonthlySchedule(
      baseProspect({
        purchaseMethod: 'financed',
        fuelConsumption: undefined,
        financing: {
          monthlyPayment: 10_000,
          interestRate: 0,
          monthlyAdminFee: 0,
          periodMonths: 60,
          restValueSek: 0,
          useAutoCalc: false,
        },
      }),
      SETTINGS,
      [],
    )
    expect(projection.byCategory.balloon).toBe(0)
    expect(projection.byCategory.financingPayment).toBe(10_000 * 60)
  })
})

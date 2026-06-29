/**
 * Cost engine types. Month index 0..119 (month 0 = first month of ownership).
 *
 * Rounding policy: each line item amount is rounded to nearest integer SEK
 * before summing into monthTotalSek and byCategory totals.
 */

export type CostCategory =
  | 'purchase'
  | 'completionItems'
  | 'financingPayment'
  | 'financingFees'
  | 'balloon'
  | 'insurance'
  | 'tax'
  | 'service'
  | 'energy'

export type MonthIndex = number

export interface MonthLineItem {
  category: CostCategory
  amountSek: number
  label?: string
}

export interface MonthlyCostRow {
  month: MonthIndex
  items: MonthLineItem[]
  monthTotalSek: number
  cumulativeSek: number
}

export interface CostProjection {
  months: MonthlyCostRow[]
  totals: { months36: number; months60: number; months120: number }
  byCategory: Record<CostCategory, number>
}

export interface FinancingInput {
  downPaymentSek?: number
  monthlyPayment: number
  interestRate: number
  monthlyAdminFee: number
  yearlyFee?: number
  periodMonths: number
  restValueSek: number
  useAutoCalc: boolean
}

export interface ProspectCostInput {
  engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  purchaseMethod: 'cash' | 'financed'
  buyPriceSek: number
  insuranceMonthlySek: number
  taxYearlySek: number
  serviceSmallSek: number
  serviceBigSek: number
  serviceIntervalMonths: number
  fuelConsumption?: number
  financing?: FinancingInput
}

export interface CompletionItemInput {
  title: string
  costSek: number
  paidUpfront: boolean
}

export interface GlobalSettingsInput {
  annualKm: number
  petrolPriceSekPerLiter: number
  dieselPriceSekPerLiter: number
  kwhPriceSekPerKwh: number
  hybridFuelPercent: number
  hybridLitersPerMil: number
  hybridKwhPerMil: number
  ownershipMonths: number
}

export const COST_CATEGORIES: CostCategory[] = [
  'purchase',
  'completionItems',
  'financingPayment',
  'financingFees',
  'balloon',
  'insurance',
  'tax',
  'service',
  'energy',
]

export function emptyCategoryTotals(): Record<CostCategory, number> {
  return {
    purchase: 0,
    completionItems: 0,
    financingPayment: 0,
    financingFees: 0,
    balloon: 0,
    insurance: 0,
    tax: 0,
    service: 0,
    energy: 0,
  }
}

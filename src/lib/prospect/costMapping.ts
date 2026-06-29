import type {
  CompletionItemInput,
  GlobalSettingsInput as CostGlobalSettingsInput,
  ProspectCostInput,
} from '~/lib/cost-engine'
import type { GlobalSettingsInput } from '~/lib/validation/settings'
import type { Doc } from '../../../convex/_generated/dataModel'

export function toProspectCostInput(prospect: Doc<'prospects'>): ProspectCostInput {
  return {
    engineType: prospect.engineType,
    purchaseMethod: prospect.purchaseMethod,
    buyPriceSek: prospect.buyPriceSek,
    insuranceMonthlySek: prospect.insuranceMonthlySek,
    taxYearlySek: prospect.taxYearlySek,
    serviceSmallSek: prospect.serviceSmallSek,
    serviceBigSek: prospect.serviceBigSek,
    serviceIntervalMonths: prospect.serviceIntervalMonths,
    fuelConsumption: prospect.fuelConsumption,
    financing:
      prospect.purchaseMethod === 'financed' && prospect.financing !== undefined
        ? {
            downPaymentSek: prospect.financing.downPaymentSek,
            monthlyPayment: prospect.financing.monthlyPayment,
            interestRate: prospect.financing.interestRate,
            monthlyAdminFee: prospect.financing.monthlyAdminFee,
            yearlyFee: prospect.financing.yearlyFee,
            periodMonths: prospect.financing.periodMonths,
            restValueSek: prospect.financing.restValueSek,
            useAutoCalc: prospect.financing.useAutoCalc,
          }
        : undefined,
  }
}

export function toCompletionItems(
  items: Array<{ title: string; costSek: number; paidUpfront: boolean }>,
): CompletionItemInput[] {
  return items.map((item) => ({
    title: item.title,
    costSek: item.costSek,
    paidUpfront: item.paidUpfront,
  }))
}

export function toCostEngineSettings(settings: GlobalSettingsInput): CostGlobalSettingsInput {
  return {
    annualKm: settings.annualKm,
    petrolPriceSekPerLiter: settings.petrolPriceSekPerLiter,
    dieselPriceSekPerLiter: settings.dieselPriceSekPerLiter,
    kwhPriceSekPerKwh: settings.kwhPriceSekPerKwh,
    hybridFuelPercent: settings.hybridFuelPercent,
    hybridLitersPerMil: settings.hybridLitersPerMil,
    hybridKwhPerMil: settings.hybridKwhPerMil,
    ownershipMonths: settings.ownershipMonths,
  }
}

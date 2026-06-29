import type { EngineType, PurchaseMethod } from '~/lib/prospect/types'
import { sv } from '~/lib/i18n/sv'

export function engineTypeLabel(type: EngineType): string {
  return sv.prospects.engineTypes[type]
}

export function purchaseMethodLabel(method: PurchaseMethod): string {
  return sv.prospects.purchaseMethods[method]
}

export const engineTypes: EngineType[] = ['petrol', 'diesel', 'electric', 'hybrid']

export const purchaseMethods: PurchaseMethod[] = ['cash', 'financed']

export function fuelConsumptionLabel(engineType: EngineType): string {
  if (engineType === 'electric') {
    return sv.prospects.fuelConsumptionKwh
  }
  return sv.prospects.fuelConsumptionLiter
}

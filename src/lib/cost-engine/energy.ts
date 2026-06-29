import type { GlobalSettingsInput, ProspectCostInput } from './types'

/** Monthly energy cost in integer SEK. Hybrid ignores prospect.fuelConsumption. */
export function computeEnergyMonthly(
  prospect: ProspectCostInput,
  settings: GlobalSettingsInput,
): number {
  const monthlyMil = settings.annualKm / 12 / 10

  switch (prospect.engineType) {
    case 'petrol':
      return Math.round(
        monthlyMil * (prospect.fuelConsumption ?? 0) * settings.petrolPriceSekPerLiter,
      )
    case 'diesel':
      return Math.round(
        monthlyMil * (prospect.fuelConsumption ?? 0) * settings.dieselPriceSekPerLiter,
      )
    case 'electric':
      return Math.round(monthlyMil * (prospect.fuelConsumption ?? 0) * settings.kwhPriceSekPerKwh)
    case 'hybrid': {
      const fuelShare = settings.hybridFuelPercent / 100
      const fuelCost =
        monthlyMil * settings.hybridLitersPerMil * fuelShare * settings.petrolPriceSekPerLiter
      const elecCost =
        monthlyMil * settings.hybridKwhPerMil * (1 - fuelShare) * settings.kwhPriceSekPerKwh
      return Math.round(fuelCost + elecCost)
    }
  }
}

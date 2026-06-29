const sekFormatter = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('sv-SE')

const decimalFormatter = new Intl.NumberFormat('sv-SE', {
  maximumFractionDigits: 2,
})

const consumptionFormatter = new Intl.NumberFormat('sv-SE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export function formatSek(amount: number): string {
  return sekFormatter.format(amount)
}

export function formatSekPerLiter(amount: number): string {
  return `${decimalFormatter.format(amount)} kr/L`
}

export function formatSekPerKwh(amount: number): string {
  return `${decimalFormatter.format(amount)} kr/kWh`
}

export function formatKm(amount: number): string {
  return `${numberFormatter.format(amount)} km`
}

/** Swedish mil (10 km), used for vehicle mileage. */
export function formatDistance(mil: number): string {
  return `${numberFormatter.format(mil)} mil`
}

export type ConsumptionUnit = 'liter' | 'kwh'

export function formatConsumption(amount: number, unit: ConsumptionUnit): string {
  const suffix = unit === 'kwh' ? 'kWh/mil' : 'L/mil'
  return `${consumptionFormatter.format(amount)} ${suffix}`
}

export function formatPercent(amount: number): string {
  return `${decimalFormatter.format(amount)} %`
}

export function formatMonths(count: number): string {
  return `${numberFormatter.format(count)} mån`
}

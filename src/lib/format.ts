const sekFormatter = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('sv-SE')

const decimalFormatter = new Intl.NumberFormat('sv-SE', {
  maximumFractionDigits: 2,
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

export function formatPercent(amount: number): string {
  return `${decimalFormatter.format(amount)} %`
}

export function formatMonths(count: number): string {
  return `${numberFormatter.format(count)} mån`
}

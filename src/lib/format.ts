const sekFormatter = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0,
})

export function formatSek(amount: number): string {
  return sekFormatter.format(amount)
}

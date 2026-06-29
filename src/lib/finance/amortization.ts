/**
 * Monthly payment for an annuity loan with balloon (restvärde).
 *
 * Swedish car loans: principal is köppris minus handpenning; restvärde is paid
 * as a lump sum at month N (not included in the monthly payment).
 *
 * Formula (monthly rate r = annualRate / 12 / 100, n = months, FV = balloon):
 *
 *   PMT = r × (PV × (1+r)^n − FV) / ((1+r)^n − 1)
 *
 * Zero interest (r = 0):
 *
 *   PMT = (PV − FV) / n
 *
 * Result rounded to nearest integer SEK.
 */
export type MonthlyPaymentInput = {
  principal: number
  /** Annual interest rate in percent, e.g. 5.5 for 5.5% */
  annualRate: number
  months: number
  /** Restvärde / balloon at end of term; 0 = fully amortizing */
  balloon: number
}

export function calculateLoanPrincipal(
  buyPriceSek: number,
  downPaymentSek?: number,
): number {
  return Math.max(0, buyPriceSek - (downPaymentSek ?? 0))
}

export function calculateMonthlyPayment({
  principal,
  annualRate,
  months,
  balloon,
}: MonthlyPaymentInput): number {
  if (months <= 0) {
    return 0
  }

  const pv = Math.max(0, principal)
  const fv = Math.max(0, balloon)

  if (pv === 0) {
    return 0
  }

  const monthlyRate = annualRate / 12 / 100

  if (monthlyRate === 0) {
    return Math.round(Math.max(0, pv - fv) / months)
  }

  const factor = (1 + monthlyRate) ** months
  const payment = (monthlyRate * (pv * factor - fv)) / (factor - 1)

  return Math.round(Math.max(0, payment))
}

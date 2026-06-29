import { describe, expect, it } from 'vitest'
import {
  calculateLoanPrincipal,
  calculateMonthlyPayment,
} from './amortization'

describe('calculateLoanPrincipal', () => {
  it('uses full buy price when no handpenning', () => {
    expect(calculateLoanPrincipal(600_000)).toBe(600_000)
    expect(calculateLoanPrincipal(600_000, undefined)).toBe(600_000)
  })

  it('subtracts handpenning from buy price', () => {
    expect(calculateLoanPrincipal(600_000, 100_000)).toBe(500_000)
  })

  it('never returns negative principal', () => {
    expect(calculateLoanPrincipal(100_000, 150_000)).toBe(0)
  })
})

describe('calculateMonthlyPayment', () => {
  it('computes fully amortizing loan (restvärde 0)', () => {
    const payment = calculateMonthlyPayment({
      principal: 600_000,
      annualRate: 5,
      months: 60,
      balloon: 0,
    })
    expect(payment).toBeGreaterThan(0)
    expect(payment).toBe(11_323)
  })

  it('reduces payment when handpenning lowers principal', () => {
    const fullPrice = calculateMonthlyPayment({
      principal: 600_000,
      annualRate: 5,
      months: 36,
      balloon: 0,
    })
    const withHandpenning = calculateMonthlyPayment({
      principal: 500_000,
      annualRate: 5,
      months: 36,
      balloon: 0,
    })
    expect(withHandpenning).toBeLessThan(fullPrice)
    expect(withHandpenning).toBe(14_985)
    expect(fullPrice).toBe(17_983)
  })

  it('handles zero interest', () => {
    expect(
      calculateMonthlyPayment({
        principal: 500_000,
        annualRate: 0,
        months: 36,
        balloon: 420_000,
      }),
    ).toBe(2222)
    expect(
      calculateMonthlyPayment({
        principal: 600_000,
        annualRate: 0,
        months: 60,
        balloon: 0,
      }),
    ).toBe(10_000)
  })

  it('supports restvärde balloon', () => {
    const payment = calculateMonthlyPayment({
      principal: 500_000,
      annualRate: 6,
      months: 36,
      balloon: 420_000,
    })
    expect(payment).toBe(4534)
  })

  it('returns integer SEK', () => {
    const payment = calculateMonthlyPayment({
      principal: 450_000,
      annualRate: 4.9,
      months: 48,
      balloon: 200_000,
    })
    expect(Number.isInteger(payment)).toBe(true)
  })
})

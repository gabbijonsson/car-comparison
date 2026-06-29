import { computeEnergyMonthly } from './energy'
import { computeServiceEvents } from './service'
import {
  type CompletionItemInput,
  type CostProjection,
  emptyCategoryTotals,
  type GlobalSettingsInput,
  type MonthLineItem,
  type ProspectCostInput,
} from './types'

function isCalendarYearEndMonth(month: number): boolean {
  return (month + 1) % 12 === 0
}

function sumUpfrontCompletionItems(items: CompletionItemInput[]): number {
  return items.filter((item) => item.paidUpfront).reduce((sum, item) => sum + item.costSek, 0)
}

export function buildMonthlySchedule(
  prospect: ProspectCostInput,
  settings: GlobalSettingsInput,
  completionItems: CompletionItemInput[],
): CostProjection {
  const totalMonths = settings.ownershipMonths
  const upfrontTotal = sumUpfrontCompletionItems(completionItems)
  const serviceEvents = computeServiceEvents(
    prospect.serviceIntervalMonths,
    prospect.serviceSmallSek,
    prospect.serviceBigSek,
    totalMonths,
  )
  const energyMonthly = computeEnergyMonthly(prospect, settings)
  const byCategory = emptyCategoryTotals()

  let cumulativeSek = 0
  const months = []

  for (let month = 0; month < totalMonths; month++) {
    const items: MonthLineItem[] = []

    if (month === 0) {
      if (prospect.purchaseMethod === 'cash') {
        items.push({
          category: 'purchase',
          amountSek: Math.round(prospect.buyPriceSek),
        })
      } else if (prospect.financing !== undefined) {
        items.push({
          category: 'purchase',
          amountSek: Math.round(prospect.financing.downPaymentSek ?? 0),
        })
      }

      if (upfrontTotal > 0) {
        items.push({
          category: 'completionItems',
          amountSek: Math.round(upfrontTotal),
        })
      }
    }

    if (prospect.purchaseMethod === 'financed' && prospect.financing !== undefined) {
      const financing = prospect.financing

      if (month < financing.periodMonths) {
        items.push({
          category: 'financingPayment',
          amountSek: Math.round(financing.monthlyPayment),
        })
        if (financing.monthlyAdminFee > 0) {
          items.push({
            category: 'financingFees',
            amountSek: Math.round(financing.monthlyAdminFee),
          })
        }
      }

      if (month === financing.periodMonths - 1 && financing.restValueSek > 0) {
        items.push({
          category: 'balloon',
          amountSek: Math.round(financing.restValueSek),
        })
      }

      const yearlyFee = financing.yearlyFee ?? 0
      if (isCalendarYearEndMonth(month) && yearlyFee > 0) {
        items.push({
          category: 'financingFees',
          amountSek: Math.round(yearlyFee),
        })
      }
    }

    if (prospect.insuranceMonthlySek > 0) {
      items.push({
        category: 'insurance',
        amountSek: Math.round(prospect.insuranceMonthlySek),
      })
    }

    if (isCalendarYearEndMonth(month) && prospect.taxYearlySek > 0) {
      items.push({
        category: 'tax',
        amountSek: Math.round(prospect.taxYearlySek),
      })
    }

    const serviceAmount = serviceEvents.get(month)
    if (serviceAmount !== undefined && serviceAmount > 0) {
      items.push({
        category: 'service',
        amountSek: serviceAmount,
      })
    }

    if (energyMonthly > 0) {
      items.push({
        category: 'energy',
        amountSek: energyMonthly,
      })
    }

    const monthTotalSek = items.reduce((sum, item) => sum + item.amountSek, 0)
    cumulativeSek += monthTotalSek

    for (const item of items) {
      byCategory[item.category] += item.amountSek
    }

    months.push({
      month,
      items,
      monthTotalSek,
      cumulativeSek,
    })
  }

  return {
    months,
    totals: {
      months36: months[35]?.cumulativeSek ?? cumulativeSek,
      months60: months[59]?.cumulativeSek ?? cumulativeSek,
      months120: months[119]?.cumulativeSek ?? cumulativeSek,
    },
    byCategory,
  }
}

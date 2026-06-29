import type { ReactNode } from 'react'
import { buildMonthlySchedule, computeEnergyMonthly } from '~/lib/cost-engine'
import {
  type EquipmentCatalogEntry,
  includedNiceToHave,
  missingMustHave,
} from '~/lib/equipment/helpers'
import { formatSek } from '~/lib/format'
import {
  toCompletionItems,
  toCostEngineSettings,
  toProspectCostInput,
} from '~/lib/prospect/costMapping'
import { engineTypeLabel, fuelConsumptionLabel, purchaseMethodLabel } from '~/lib/prospect/labels'
import type { GlobalSettingsInput } from '~/lib/validation/settings'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

export type ComparisonProspect = {
  id: Id<'prospects'>
  title: string
  brand: string
  model: string
  modelYear: string
  mileage: string
  engineType: string
  purchaseMethod: string
  buyPriceSek: string
  completionItemsTotal: string
  completionItemsUpfront: string
  handpenning: string
  monthlyPayment: string
  interestRate: string
  monthlyAdminFee: string
  yearlyFee: string
  periodMonths: string
  restValue: string
  insuranceMonthly: string
  taxYearly: string
  serviceSmall: string
  serviceBig: string
  serviceInterval: string
  fuelConsumption: string
  energyMonthly: string
  total3yr: string
  total5yr: string
  total10yr: string
  missingMustHave: EquipmentCatalogEntry[]
  includedNiceToHave: EquipmentCatalogEntry[]
  avgScore: string
  ratingCount: number
  vetoCount: number
  hasVeto: boolean
  links: Array<{ id: string; title: string; url: string }>
}

export type ComparisonRow = {
  id: string
  section: string
  label: string
  isSectionHeader?: boolean
  getValue: (prospect: ComparisonProspect) => ReactNode
}

type ComparisonSourceRow = {
  prospect: Doc<'prospects'>
  purchaseItems: Array<{ title: string; costSek: number; paidUpfront: boolean }>
  equipment: Array<{ equipmentId: Id<'equipment'>; isPresent: boolean }>
  sourceLinks: Array<{ _id: Id<'sourceLinks'>; title: string; url: string }>
  avgScore: number | null
  ratingCount: number
  vetoCount: number
  hasVeto: boolean
}

function dash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  return String(value)
}

function formatScore(avgScore: number | null, ratingCount: number): string {
  if (ratingCount === 0 || avgScore === null) {
    return '—'
  }
  return `${avgScore.toFixed(1)}/5 (${ratingCount})`
}

export function buildComparisonProspects(
  rows: ComparisonSourceRow[],
  settings: GlobalSettingsInput,
  catalog: EquipmentCatalogEntry[],
): ComparisonProspect[] {
  const engineSettings = toCostEngineSettings(settings)

  return rows.map((row) => {
    const {
      prospect,
      purchaseItems,
      equipment,
      sourceLinks,
      avgScore,
      ratingCount,
      vetoCount,
      hasVeto,
    } = row
    const completionItems = toCompletionItems(purchaseItems)
    const projection = buildMonthlySchedule(
      toProspectCostInput(prospect),
      engineSettings,
      completionItems,
    )
    const energyMonthly = computeEnergyMonthly(toProspectCostInput(prospect), engineSettings)
    const completionTotal = purchaseItems.reduce((sum, item) => sum + item.costSek, 0)
    const upfrontTotal = purchaseItems
      .filter((item) => item.paidUpfront)
      .reduce((sum, item) => sum + item.costSek, 0)
    const financing = prospect.financing
    const fuelLabel = fuelConsumptionLabel(prospect.engineType)

    return {
      id: prospect._id,
      title: prospect.title,
      brand: prospect.brand,
      model: prospect.model,
      modelYear: dash(prospect.modelYear),
      mileage:
        prospect.mileage !== undefined ? `${prospect.mileage.toLocaleString('sv-SE')} mil` : '—',
      engineType: engineTypeLabel(prospect.engineType),
      purchaseMethod: purchaseMethodLabel(prospect.purchaseMethod),
      buyPriceSek: formatSek(prospect.buyPriceSek),
      completionItemsTotal: purchaseItems.length > 0 ? formatSek(completionTotal) : '—',
      completionItemsUpfront: upfrontTotal > 0 ? formatSek(upfrontTotal) : '—',
      handpenning:
        prospect.purchaseMethod === 'financed' && financing
          ? formatSek(financing.downPaymentSek ?? 0)
          : '—',
      monthlyPayment:
        prospect.purchaseMethod === 'financed' && financing
          ? formatSek(financing.monthlyPayment)
          : '—',
      interestRate:
        prospect.purchaseMethod === 'financed' && financing ? `${financing.interestRate} %` : '—',
      monthlyAdminFee:
        prospect.purchaseMethod === 'financed' && financing
          ? formatSek(financing.monthlyAdminFee)
          : '—',
      yearlyFee:
        prospect.purchaseMethod === 'financed' && financing?.yearlyFee !== undefined
          ? formatSek(financing.yearlyFee)
          : '—',
      periodMonths:
        prospect.purchaseMethod === 'financed' && financing ? `${financing.periodMonths} mån` : '—',
      restValue:
        prospect.purchaseMethod === 'financed' && financing
          ? formatSek(financing.restValueSek)
          : '—',
      insuranceMonthly: formatSek(prospect.insuranceMonthlySek),
      taxYearly: formatSek(prospect.taxYearlySek),
      serviceSmall: formatSek(prospect.serviceSmallSek),
      serviceBig: formatSek(prospect.serviceBigSek),
      serviceInterval: `${prospect.serviceIntervalMonths} mån`,
      fuelConsumption:
        prospect.engineType === 'hybrid' || prospect.fuelConsumption === undefined
          ? '—'
          : `${prospect.fuelConsumption} ${prospect.engineType === 'electric' ? 'kWh/mil' : 'L/mil'}`,
      energyMonthly: `${formatSek(energyMonthly)}/mån (${fuelLabel.toLowerCase()})`,
      total3yr: formatSek(projection.totals.months36),
      total5yr: formatSek(projection.totals.months60),
      total10yr: formatSek(projection.totals.months120),
      missingMustHave: missingMustHave(equipment, catalog),
      includedNiceToHave: includedNiceToHave(equipment, catalog),
      avgScore: formatScore(avgScore, ratingCount),
      ratingCount,
      vetoCount,
      hasVeto,
      links: sourceLinks.map((link) => ({
        id: link._id,
        title: link.title,
        url: link.url,
      })),
    }
  })
}

export function buildComparisonRows(
  sectionLabels: Record<string, string>,
  fieldLabels: Record<string, string>,
): ComparisonRow[] {
  return [
    {
      id: 'identity',
      section: 'identity',
      label: sectionLabels.identity,
      isSectionHeader: true,
      getValue: () => null,
    },
    { id: 'title', section: 'identity', label: fieldLabels.title, getValue: (p) => p.title },
    {
      id: 'brandModel',
      section: 'identity',
      label: fieldLabels.brandModel,
      getValue: (p) => `${p.brand} ${p.model}`,
    },
    {
      id: 'modelYear',
      section: 'identity',
      label: fieldLabels.modelYear,
      getValue: (p) => p.modelYear,
    },
    { id: 'mileage', section: 'identity', label: fieldLabels.mileage, getValue: (p) => p.mileage },
    {
      id: 'engineType',
      section: 'identity',
      label: fieldLabels.engineType,
      getValue: (p) => p.engineType,
    },
    {
      id: 'purchaseMethod',
      section: 'identity',
      label: fieldLabels.purchaseMethod,
      getValue: (p) => p.purchaseMethod,
    },

    {
      id: 'price',
      section: 'price',
      label: sectionLabels.price,
      isSectionHeader: true,
      getValue: () => null,
    },
    {
      id: 'buyPrice',
      section: 'price',
      label: fieldLabels.buyPrice,
      getValue: (p) => p.buyPriceSek,
    },
    {
      id: 'completionTotal',
      section: 'price',
      label: fieldLabels.completionTotal,
      getValue: (p) => p.completionItemsTotal,
    },
    {
      id: 'completionUpfront',
      section: 'price',
      label: fieldLabels.completionUpfront,
      getValue: (p) => p.completionItemsUpfront,
    },

    {
      id: 'financing',
      section: 'financing',
      label: sectionLabels.financing,
      isSectionHeader: true,
      getValue: () => null,
    },
    {
      id: 'handpenning',
      section: 'financing',
      label: fieldLabels.handpenning,
      getValue: (p) => p.handpenning,
    },
    {
      id: 'monthlyPayment',
      section: 'financing',
      label: fieldLabels.monthlyPayment,
      getValue: (p) => p.monthlyPayment,
    },
    {
      id: 'interestRate',
      section: 'financing',
      label: fieldLabels.interestRate,
      getValue: (p) => p.interestRate,
    },
    {
      id: 'monthlyAdminFee',
      section: 'financing',
      label: fieldLabels.monthlyAdminFee,
      getValue: (p) => p.monthlyAdminFee,
    },
    {
      id: 'yearlyFee',
      section: 'financing',
      label: fieldLabels.yearlyFee,
      getValue: (p) => p.yearlyFee,
    },
    {
      id: 'periodMonths',
      section: 'financing',
      label: fieldLabels.periodMonths,
      getValue: (p) => p.periodMonths,
    },
    {
      id: 'restValue',
      section: 'financing',
      label: fieldLabels.restValue,
      getValue: (p) => p.restValue,
    },

    {
      id: 'running',
      section: 'running',
      label: sectionLabels.running,
      isSectionHeader: true,
      getValue: () => null,
    },
    {
      id: 'insurance',
      section: 'running',
      label: fieldLabels.insurance,
      getValue: (p) => p.insuranceMonthly,
    },
    { id: 'tax', section: 'running', label: fieldLabels.tax, getValue: (p) => p.taxYearly },
    {
      id: 'serviceSmall',
      section: 'running',
      label: fieldLabels.serviceSmall,
      getValue: (p) => p.serviceSmall,
    },
    {
      id: 'serviceBig',
      section: 'running',
      label: fieldLabels.serviceBig,
      getValue: (p) => p.serviceBig,
    },
    {
      id: 'serviceInterval',
      section: 'running',
      label: fieldLabels.serviceInterval,
      getValue: (p) => p.serviceInterval,
    },
    {
      id: 'fuelConsumption',
      section: 'running',
      label: fieldLabels.fuelConsumption,
      getValue: (p) => p.fuelConsumption,
    },
    {
      id: 'energyMonthly',
      section: 'running',
      label: fieldLabels.energyMonthly,
      getValue: (p) => p.energyMonthly,
    },

    {
      id: 'totals',
      section: 'totals',
      label: sectionLabels.totals,
      isSectionHeader: true,
      getValue: () => null,
    },
    { id: 'total3yr', section: 'totals', label: fieldLabels.total3yr, getValue: (p) => p.total3yr },
    { id: 'total5yr', section: 'totals', label: fieldLabels.total5yr, getValue: (p) => p.total5yr },
    {
      id: 'total10yr',
      section: 'totals',
      label: fieldLabels.total10yr,
      getValue: (p) => p.total10yr,
    },

    {
      id: 'equipment',
      section: 'equipment',
      label: sectionLabels.equipment,
      isSectionHeader: true,
      getValue: () => null,
    },
    {
      id: 'missingMustHave',
      section: 'equipment',
      label: fieldLabels.missingMustHave,
      getValue: () => null,
    },
    {
      id: 'includedNiceToHave',
      section: 'equipment',
      label: fieldLabels.includedNiceToHave,
      getValue: () => null,
    },

    {
      id: 'social',
      section: 'social',
      label: sectionLabels.social,
      isSectionHeader: true,
      getValue: () => null,
    },
    { id: 'rating', section: 'social', label: fieldLabels.rating, getValue: (p) => p.avgScore },
    { id: 'veto', section: 'social', label: fieldLabels.veto, getValue: (p) => p.vetoCount },

    {
      id: 'links',
      section: 'links',
      label: sectionLabels.links,
      isSectionHeader: true,
      getValue: () => null,
    },
    { id: 'sourceLinks', section: 'links', label: fieldLabels.sourceLinks, getValue: () => null },
  ]
}

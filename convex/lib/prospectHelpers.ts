import type { Doc } from '../_generated/dataModel'

type ProspectFields = Pick<
  Doc<'prospects'>,
  | 'brand'
  | 'model'
  | 'title'
  | 'engineType'
  | 'purchaseMethod'
  | 'buyPriceSek'
  | 'insuranceMonthlySek'
  | 'taxYearlySek'
  | 'serviceSmallSek'
  | 'serviceBigSek'
  | 'serviceIntervalMonths'
  | 'fuelConsumption'
  | 'financing'
>

export function assertValidProspectFields(fields: ProspectFields): void {
  if (fields.brand.trim().length === 0) {
    throw new Error('Märke krävs')
  }
  if (fields.model.trim().length === 0) {
    throw new Error('Modell krävs')
  }
  if (fields.title.trim().length === 0) {
    throw new Error('Titel krävs')
  }
  if (fields.buyPriceSek < 0) {
    throw new Error('Köppris måste vara 0 eller högre')
  }
  if (fields.insuranceMonthlySek < 0) {
    throw new Error('Försäkring måste vara 0 eller högre')
  }
  if (fields.taxYearlySek < 0) {
    throw new Error('Skatt måste vara 0 eller högre')
  }
  if (fields.serviceSmallSek < 0 || fields.serviceBigSek < 0) {
    throw new Error('Servicekostnad måste vara 0 eller högre')
  }
  if (!Number.isInteger(fields.serviceIntervalMonths) || fields.serviceIntervalMonths <= 0) {
    throw new Error('Serviceintervall måste vara ett positivt heltal')
  }
  if (fields.engineType !== 'hybrid') {
    if (fields.fuelConsumption === undefined || fields.fuelConsumption <= 0) {
      throw new Error('Förbrukning krävs')
    }
  }
  if (fields.purchaseMethod === 'financed' && fields.financing === undefined) {
    throw new Error('Finansieringsuppgifter krävs')
  }
  if (fields.purchaseMethod === 'financed' && fields.financing !== undefined) {
    const f = fields.financing
    if (f.monthlyPayment < 0) {
      throw new Error('Månadskostnad måste vara 0 eller högre')
    }
    if (f.periodMonths <= 0) {
      throw new Error('Löptid måste vara större än 0')
    }
  }
}

export function normalizeProspectFields<T extends ProspectFields>(fields: T): T {
  const normalized = { ...fields }
  if (normalized.purchaseMethod === 'cash') {
    normalized.financing = undefined
  }
  if (normalized.engineType === 'hybrid') {
    normalized.fuelConsumption = undefined
  }
  return normalized
}

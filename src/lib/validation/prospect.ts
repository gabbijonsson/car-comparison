import { z } from 'zod'
import { engineTypeSchema, purchaseMethodSchema } from './enums'
import { financingSchema } from './financing'
import { sourceLinkSchema } from './links'
import { validationMessages as m } from './messages'
import {
  nonnegativeNumber,
  optionalNonnegative,
  optionalYear,
  positiveNumber,
  requiredTrimmedString,
} from './primitives'

const purchaseItemSchema = z.object({
  clientKey: z.string(),
  title: requiredTrimmedString(m.purchaseItemTitleRequired),
  costSek: nonnegativeNumber,
  paidUpfront: z.boolean(),
})

const equipmentLinkSchema = z.object({
  equipmentId: z.string(),
  isPresent: z.boolean(),
})

export const prospectFormSchema = z
  .object({
    brand: requiredTrimmedString(m.brandRequired),
    model: requiredTrimmedString(m.modelRequired),
    title: requiredTrimmedString(m.titleRequired),
    modelYear: optionalYear,
    registrationYear: optionalYear,
    mileage: optionalNonnegative,
    engineType: engineTypeSchema,
    purchaseMethod: purchaseMethodSchema,
    buyPriceSek: nonnegativeNumber,
    packageDescription: z.string().optional(),
    insuranceMonthlySek: nonnegativeNumber,
    taxYearlySek: nonnegativeNumber,
    serviceSmallSek: nonnegativeNumber,
    serviceBigSek: nonnegativeNumber,
    serviceIntervalMonths: z.number().int().positive(m.serviceIntervalPositive),
    fuelConsumption: positiveNumber.optional(),
    financing: financingSchema.optional(),
    freeTextTagsInput: z.string(),
    equipment: z.array(equipmentLinkSchema),
    purchaseItems: z.array(purchaseItemSchema),
    sourceLinks: z.array(sourceLinkSchema),
  })
  .superRefine((data, ctx) => {
    if (data.engineType !== 'hybrid') {
      if (data.fuelConsumption === undefined || data.fuelConsumption <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: m.consumptionRequired,
          path: ['fuelConsumption'],
        })
      }
    }
    if (data.purchaseMethod === 'financed' && data.financing === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: m.financingRequired,
        path: ['financing'],
      })
    }
  })

export type ProspectFormInput = z.infer<typeof prospectFormSchema>

export function parseFreeTextTags(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

export function formatFreeTextTags(tags: string[]): string {
  return tags.join(', ')
}

export const defaultFinancing = {
  downPaymentSek: undefined as number | undefined,
  monthlyPayment: 0,
  interestRate: 0,
  monthlyAdminFee: 0,
  yearlyFee: undefined as number | undefined,
  periodMonths: 36,
  restValueSek: 0,
  useAutoCalc: false,
} as const

export function newPurchaseItem(): ProspectFormInput['purchaseItems'][number] {
  return { clientKey: crypto.randomUUID(), title: '', costSek: 0, paidUpfront: true }
}

export function newSourceLink(): ProspectFormInput['sourceLinks'][number] {
  return { clientKey: crypto.randomUUID(), title: '', url: '', description: '' }
}

export const defaultProspectFormValues: ProspectFormInput = {
  brand: '',
  model: '',
  title: '',
  engineType: 'petrol',
  purchaseMethod: 'cash',
  buyPriceSek: 0,
  insuranceMonthlySek: 0,
  taxYearlySek: 0,
  serviceSmallSek: 0,
  serviceBigSek: 0,
  serviceIntervalMonths: 12,
  freeTextTagsInput: '',
  equipment: [],
  purchaseItems: [],
  sourceLinks: [],
}

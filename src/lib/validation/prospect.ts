import { z } from 'zod'
import { engineTypeSchema, financingSchema, purchaseMethodSchema } from './enums'

const purchaseItemSchema = z.object({
  clientKey: z.string(),
  title: z.string().trim().min(1, 'Titel krävs'),
  costSek: z.number().nonnegative(),
  paidUpfront: z.boolean(),
})

const sourceLinkSchema = z.object({
  clientKey: z.string(),
  title: z.string().trim().min(1, 'Titel krävs'),
  url: z.string().trim().min(1, 'URL krävs'),
  description: z.string().optional(),
})

const equipmentLinkSchema = z.object({
  equipmentId: z.string(),
  isPresent: z.boolean(),
})

export const prospectFormSchema = z
  .object({
    brand: z.string().trim().min(1, 'Märke krävs'),
    model: z.string().trim().min(1, 'Modell krävs'),
    title: z.string().trim().min(1, 'Titel krävs'),
    modelYear: z.number().int().min(1900).max(2100).optional(),
    registrationYear: z.number().int().min(1900).max(2100).optional(),
    mileage: z.number().nonnegative().optional(),
    engineType: engineTypeSchema,
    purchaseMethod: purchaseMethodSchema,
    buyPriceSek: z.number().nonnegative(),
    packageDescription: z.string().optional(),
    insuranceMonthlySek: z.number().nonnegative(),
    taxYearlySek: z.number().nonnegative(),
    serviceSmallSek: z.number().nonnegative(),
    serviceBigSek: z.number().nonnegative(),
    serviceIntervalMonths: z.number().int().positive('Serviceintervall måste vara positivt'),
    fuelConsumption: z.number().positive().optional(),
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
          message: 'Förbrukning krävs',
          path: ['fuelConsumption'],
        })
      }
    }
    if (data.purchaseMethod === 'financed' && data.financing === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Finansieringsuppgifter krävs',
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

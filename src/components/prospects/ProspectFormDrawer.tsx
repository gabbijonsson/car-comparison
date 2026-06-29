import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from 'convex/react'
import { CircleHelp, Plus, Trash2 } from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { EquipmentPriorityBadge } from '~/components/equipment/EquipmentPriorityBadge'
import { FormDrawer } from '~/components/layout/FormDrawer'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { equipmentCategoryLabel } from '~/lib/equipment/labels'
import { calculateLoanPrincipal, calculateMonthlyPayment } from '~/lib/finance/amortization'
import { formatSek } from '~/lib/format'
import { sv } from '~/lib/i18n/sv'
import {
  engineTypeLabel,
  engineTypes,
  fuelConsumptionLabel,
  purchaseMethodLabel,
  purchaseMethods,
} from '~/lib/prospect/labels'
import type { EngineType, PurchaseMethod } from '~/lib/prospect/types'
import {
  fieldError,
  firstZodIssue,
  nonnegativeFieldValidator,
  positiveFieldValidator,
  positiveIntFieldValidator,
} from '~/lib/validation/form'
import { periodMonthsFieldValidator } from '~/lib/validation/financing'
import { isValidHttpUrl } from '~/lib/validation/primitives'
import { validationMessages as m } from '~/lib/validation/messages'
import {
  defaultFinancing,
  defaultProspectFormValues,
  formatFreeTextTags,
  newPurchaseItem,
  newSourceLink,
  type ProspectFormInput,
  parseFreeTextTags,
  prospectFormSchema,
} from '~/lib/validation/prospect'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type ProspectFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectId?: Id<'prospects'>
}

function parseNumberInput(value: string): number {
  const normalized = value.replace(',', '.')
  return Number(normalized)
}

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined
  }
  return parseNumberInput(value)
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h3 className="font-heading text-lg font-medium">{title}</h3>
      {children}
    </section>
  )
}

export function ProspectFormDrawer({ open, onOpenChange, prospectId }: ProspectFormDrawerProps) {
  const isEditing = prospectId !== undefined
  const details = useQuery(api.prospects.getDetails, prospectId ? { id: prospectId } : 'skip')
  const equipmentCatalog = useQuery(api.equipment.list, {})

  const createProspect = useMutation(api.prospects.create)
  const updateProspect = useMutation(api.prospects.update)
  const syncEquipment = useMutation(api.prospects.syncEquipment)
  const syncPurchaseItems = useMutation(api.prospects.syncPurchaseItems)
  const syncSourceLinks = useMutation(api.prospects.syncSourceLinks)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const initialValues = useMemo((): ProspectFormInput => {
    if (!isEditing || details === undefined || details === null) {
      return defaultProspectFormValues
    }
    const p = details.prospect
    return {
      brand: p.brand,
      model: p.model,
      title: p.title,
      modelYear: p.modelYear,
      registrationYear: p.registrationYear,
      mileage: p.mileage,
      engineType: p.engineType,
      purchaseMethod: p.purchaseMethod,
      buyPriceSek: p.buyPriceSek,
      packageDescription: p.packageDescription ?? '',
      insuranceMonthlySek: p.insuranceMonthlySek,
      taxYearlySek: p.taxYearlySek,
      serviceSmallSek: p.serviceSmallSek,
      serviceBigSek: p.serviceBigSek,
      serviceIntervalMonths: p.serviceIntervalMonths,
      fuelConsumption: p.fuelConsumption,
      financing:
        p.financing ?? (p.purchaseMethod === 'financed' ? { ...defaultFinancing } : undefined),
      freeTextTagsInput: formatFreeTextTags(p.freeTextEquipmentTags),
      equipment: details.equipment.map((row) => ({
        equipmentId: row.equipmentId,
        isPresent: row.isPresent,
      })),
      purchaseItems: details.purchaseItems.map((item) => ({
        clientKey: crypto.randomUUID(),
        title: item.title,
        costSek: item.costSek,
        paidUpfront: item.paidUpfront,
      })),
      sourceLinks: details.sourceLinks.map((link) => ({
        clientKey: crypto.randomUUID(),
        title: link.title,
        url: link.url,
        description: link.description ?? '',
      })),
    }
  }, [isEditing, details])

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const parsed = prospectFormSchema.safeParse(value)
      if (!parsed.success) {
        setSubmitError(firstZodIssue(parsed.error))
        return
      }

      const {
        freeTextTagsInput,
        equipment,
        purchaseItems,
        sourceLinks,
        financing,
        packageDescription,
        ...prospectFields
      } = parsed.data

      const payload = {
        ...prospectFields,
        packageDescription: packageDescription?.trim() || undefined,
        freeTextEquipmentTags: parseFreeTextTags(freeTextTagsInput),
        financing: prospectFields.purchaseMethod === 'financed' ? financing : undefined,
        fuelConsumption:
          prospectFields.engineType === 'hybrid' ? undefined : prospectFields.fuelConsumption,
      }

      try {
        let savedId = prospectId
        if (isEditing && prospectId !== undefined) {
          await updateProspect({ id: prospectId, ...payload })
        } else {
          savedId = await createProspect(payload)
        }

        if (savedId === undefined) {
          throw new Error(sv.common.saveError)
        }

        const equipmentItems = (equipmentCatalog ?? []).map((item) => ({
          equipmentId: item._id,
          isPresent: equipment.find((row) => row.equipmentId === item._id)?.isPresent ?? false,
        }))

        await syncEquipment({ prospectId: savedId, items: equipmentItems })
        await syncPurchaseItems({
          prospectId: savedId,
          items: purchaseItems.map(({ clientKey: _, ...item }) => item),
        })
        await syncSourceLinks({
          prospectId: savedId,
          links: sourceLinks.map(({ clientKey: _, ...link }) => link),
        })

        onOpenChange(false)
      } catch (cause: unknown) {
        const message = cause instanceof Error ? cause.message : sv.common.saveError
        setSubmitError(message)
      }
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(initialValues)
      setSubmitError(null)
    }
  }, [open, initialValues, form])

  const isLoadingDetails = isEditing && details === undefined

  function setEquipmentPresent(equipmentId: string, isPresent: boolean) {
    const current = form.getFieldValue('equipment')
    const index = current.findIndex((row) => row.equipmentId === equipmentId)
    if (index >= 0) {
      form.setFieldValue(
        'equipment',
        current.map((row, i) => (i === index ? { ...row, isPresent } : row)),
      )
    } else {
      form.setFieldValue('equipment', [...current, { equipmentId, isPresent }])
    }
  }

  function equipmentIsPresent(equipmentId: string): boolean {
    return (
      form.getFieldValue('equipment').find((row) => row.equipmentId === equipmentId)?.isPresent ??
      false
    )
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? sv.prospects.edit : sv.prospects.add}
    >
      {isLoadingDetails ? (
        <p className="text-muted-foreground">{sv.common.loading}</p>
      ) : (
        <form
          className="grid gap-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FormSection title={sv.prospects.sections.identity}>
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) => (value.trim().length === 0 ? m.titleRequired : undefined),
              }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="prospect-title">{sv.prospects.listingTitle}</Label>
                  <Input
                    id="prospect-title"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {fieldError(field.state.meta.errors) ? (
                    <p className="text-sm text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="brand"
                validators={{
                  onChange: ({ value }) => (value.trim().length === 0 ? m.brandRequired : undefined),
                }}
              >
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-brand">{sv.prospects.brand}</Label>
                    <Input
                      id="prospect-brand"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {fieldError(field.state.meta.errors) ? (
                      <p className="text-sm text-destructive">
                        {fieldError(field.state.meta.errors)}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="model"
                validators={{
                  onChange: ({ value }) => (value.trim().length === 0 ? m.modelRequired : undefined),
                }}
              >
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-model">{sv.prospects.model}</Label>
                    <Input
                      id="prospect-model"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {fieldError(field.state.meta.errors) ? (
                      <p className="text-sm text-destructive">
                        {fieldError(field.state.meta.errors)}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="modelYear">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-model-year">{sv.prospects.modelYear}</Label>
                    <Input
                      id="prospect-model-year"
                      type="number"
                      value={field.state.value ?? ''}
                      onChange={(event) =>
                        field.handleChange(parseOptionalNumber(event.target.value))
                      }
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="registrationYear">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-reg-year">{sv.prospects.registrationYear}</Label>
                    <Input
                      id="prospect-reg-year"
                      type="number"
                      value={field.state.value ?? ''}
                      onChange={(event) =>
                        field.handleChange(parseOptionalNumber(event.target.value))
                      }
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="mileage">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-mileage">{sv.prospects.mileage}</Label>
                    <Input
                      id="prospect-mileage"
                      type="number"
                      min={0}
                      value={field.state.value ?? ''}
                      onChange={(event) =>
                        field.handleChange(parseOptionalNumber(event.target.value))
                      }
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="engineType">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="prospect-engine">{sv.prospects.engineType}</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value as EngineType)
                      if (value === 'hybrid') {
                        form.setFieldValue('fuelConsumption', undefined)
                      }
                    }}
                  >
                    <SelectTrigger id="prospect-engine" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {engineTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {engineTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </FormSection>

          <FormSection title={sv.prospects.sections.price}>
            <form.Field
              name="buyPriceSek"
              validators={{ onChange: ({ value }) => nonnegativeFieldValidator(value) }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="prospect-buy-price">{sv.prospects.buyPrice}</Label>
                  <Input
                    id="prospect-buy-price"
                    type="number"
                    min={0}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                    onBlur={field.handleBlur}
                  />
                  {fieldError(field.state.meta.errors) ? (
                    <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="packageDescription">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="prospect-package">{sv.prospects.packageDescription}</Label>
                  <Input
                    id="prospect-package"
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="purchaseMethod">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="prospect-purchase-method">{sv.prospects.purchaseMethod}</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value as PurchaseMethod)
                      if (value === 'financed' && form.getFieldValue('financing') === undefined) {
                        form.setFieldValue('financing', { ...defaultFinancing })
                      }
                      if (value === 'cash') {
                        form.setFieldValue('financing', undefined)
                      }
                    }}
                  >
                    <SelectTrigger id="prospect-purchase-method" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {purchaseMethodLabel(method)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="purchaseItems" mode="array">
              {(field) => (
                <div className="grid gap-3">
                  <Label>{sv.prospects.addPurchaseItem}</Label>
                  {field.state.value.map((item, index) => (
                    <div
                      key={item.clientKey}
                      className="grid gap-2 rounded-md border border-border p-3"
                    >
                      <form.Field name={`purchaseItems[${index}].title`}>
                        {(itemField) => (
                          <Input
                            placeholder={sv.prospects.purchaseItemTitle}
                            value={itemField.state.value}
                            onChange={(event) => itemField.handleChange(event.target.value)}
                          />
                        )}
                      </form.Field>
                      <div className="flex flex-wrap items-center gap-3">
                        <form.Field name={`purchaseItems[${index}].costSek`}>
                          {(itemField) => (
                            <Input
                              type="number"
                              min={0}
                              className="w-32"
                              placeholder={sv.prospects.purchaseItemCost}
                              value={itemField.state.value}
                              onChange={(event) =>
                                itemField.handleChange(parseNumberInput(event.target.value))
                              }
                            />
                          )}
                        </form.Field>
                        <form.Field name={`purchaseItems[${index}].paidUpfront`}>
                          {(itemField) => (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="size-4 rounded border border-input"
                                checked={itemField.state.value}
                                onChange={(event) => itemField.handleChange(event.target.checked)}
                              />
                              {sv.prospects.purchaseItemUpfront}
                            </label>
                          )}
                        </form.Field>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={sv.common.delete}
                          onClick={() => field.removeValue(index)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => field.pushValue(newPurchaseItem())}
                  >
                    <Plus />
                    {sv.prospects.addPurchaseItem}
                  </Button>
                </div>
              )}
            </form.Field>
          </FormSection>

          <form.Subscribe selector={(state) => state.values.purchaseMethod}>
            {(purchaseMethod) =>
              purchaseMethod === 'financed' ? (
                <FormSection title={sv.prospects.sections.financing}>
                  <form.Field name="financing.downPaymentSek">
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor="prospect-handpenning">{sv.prospects.handpenning}</Label>
                        <Input
                          id="prospect-handpenning"
                          type="number"
                          min={0}
                          value={field.state.value ?? ''}
                          onChange={(event) =>
                            field.handleChange(parseOptionalNumber(event.target.value))
                          }
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Subscribe
                    selector={(state) => ({
                      buyPriceSek: state.values.buyPriceSek,
                      downPaymentSek: state.values.financing?.downPaymentSek,
                    })}
                  >
                    {({ buyPriceSek, downPaymentSek }) => (
                      <p className="text-sm text-muted-foreground">
                        {sv.prospects.loanAmount}:{' '}
                        <span className="font-medium text-foreground">
                          {formatSek(calculateLoanPrincipal(buyPriceSek, downPaymentSek))}
                        </span>
                      </p>
                    )}
                  </form.Subscribe>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.Field name="financing.monthlyPayment">
                      {(field) => (
                        <div className="grid gap-2">
                          <Label htmlFor="prospect-monthly">{sv.prospects.monthlyPayment}</Label>
                          <Input
                            id="prospect-monthly"
                            type="number"
                            min={0}
                            value={field.state.value ?? 0}
                            onChange={(event) => {
                              field.handleChange(parseNumberInput(event.target.value))
                              form.setFieldValue('financing.useAutoCalc', false)
                            }}
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="financing.interestRate">
                      {(field) => (
                        <div className="grid gap-2">
                          <Label htmlFor="prospect-interest">{sv.prospects.interestRate}</Label>
                          <Input
                            id="prospect-interest"
                            type="number"
                            min={0}
                            step="0.01"
                            value={field.state.value ?? 0}
                            onChange={(event) =>
                              field.handleChange(parseNumberInput(event.target.value))
                            }
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="financing.monthlyAdminFee">
                      {(field) => (
                        <div className="grid gap-2">
                          <Label htmlFor="prospect-admin-fee">{sv.prospects.monthlyAdminFee}</Label>
                          <Input
                            id="prospect-admin-fee"
                            type="number"
                            min={0}
                            value={field.state.value ?? 0}
                            onChange={(event) =>
                              field.handleChange(parseNumberInput(event.target.value))
                            }
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="financing.yearlyFee">
                      {(field) => (
                        <div className="grid gap-2">
                          <Label htmlFor="prospect-yearly-fee">{sv.prospects.yearlyFee}</Label>
                          <Input
                            id="prospect-yearly-fee"
                            type="number"
                            min={0}
                            value={field.state.value ?? ''}
                            onChange={(event) =>
                              field.handleChange(parseOptionalNumber(event.target.value))
                            }
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field
                      name="financing.periodMonths"
                      validators={{ onChange: ({ value }) => periodMonthsFieldValidator(value ?? 0) }}
                    >
                      {(field) => (
                        <div className="grid gap-2">
                          <Label htmlFor="prospect-period">{sv.prospects.periodMonths}</Label>
                          <Input
                            id="prospect-period"
                            type="number"
                            min={1}
                            value={field.state.value ?? 36}
                            onChange={(event) =>
                              field.handleChange(parseNumberInput(event.target.value))
                            }
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="financing.restValueSek">
                      {(field) => (
                        <div className="grid gap-2">
                          <Label htmlFor="prospect-rest-value">{sv.prospects.restValue}</Label>
                          <Input
                            id="prospect-rest-value"
                            type="number"
                            min={0}
                            value={field.state.value ?? 0}
                            onChange={(event) =>
                              field.handleChange(parseNumberInput(event.target.value))
                            }
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>

                  <form.Subscribe
                    selector={(state) => ({
                      buyPriceSek: state.values.buyPriceSek,
                      financing: state.values.financing,
                    })}
                  >
                    {({ buyPriceSek, financing }) => (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (financing === undefined) {
                              return
                            }
                            const principal = calculateLoanPrincipal(
                              buyPriceSek,
                              financing.downPaymentSek,
                            )
                            const suggested = calculateMonthlyPayment({
                              principal,
                              annualRate: financing.interestRate,
                              months: financing.periodMonths,
                              balloon: financing.restValueSek,
                            })
                            form.setFieldValue('financing.monthlyPayment', suggested)
                            form.setFieldValue('financing.useAutoCalc', true)
                          }}
                        >
                          {sv.prospects.useAutoCalc}
                        </Button>
                        <span
                          className="inline-flex text-muted-foreground"
                          title={sv.prospects.autoCalcTooltip}
                        >
                          <CircleHelp className="size-4" aria-hidden />
                          <span className="sr-only">{sv.prospects.autoCalcTooltip}</span>
                        </span>
                      </div>
                    )}
                  </form.Subscribe>
                </FormSection>
              ) : null
            }
          </form.Subscribe>

          <FormSection title={sv.prospects.sections.runningCosts}>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="insuranceMonthlySek"
                validators={{ onChange: ({ value }) => nonnegativeFieldValidator(value) }}
              >
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-insurance">{sv.prospects.insuranceMonthly}</Label>
                    <Input
                      id="prospect-insurance"
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                      onBlur={field.handleBlur}
                    />
                    {fieldError(field.state.meta.errors) ? (
                      <p className="text-sm text-destructive">
                        {fieldError(field.state.meta.errors)}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="taxYearlySek"
                validators={{ onChange: ({ value }) => nonnegativeFieldValidator(value) }}
              >
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-tax">{sv.prospects.taxYearly}</Label>
                    <Input
                      id="prospect-tax"
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="serviceSmallSek">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-service-small">{sv.prospects.serviceSmall}</Label>
                    <Input
                      id="prospect-service-small"
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="serviceBigSek">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-service-big">{sv.prospects.serviceBig}</Label>
                    <Input
                      id="prospect-service-big"
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="serviceIntervalMonths"
                validators={{ onChange: ({ value }) => positiveIntFieldValidator(value) }}
              >
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="prospect-service-interval">
                      {sv.prospects.serviceInterval}
                    </Label>
                    <Input
                      id="prospect-service-interval"
                      type="number"
                      min={1}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe selector={(state) => state.values.engineType}>
              {(engineType) =>
                engineType !== 'hybrid' ? (
                  <form.Field
                    name="fuelConsumption"
                    validators={{
                      onChange: ({ value }) =>
                        value === undefined ? m.consumptionRequired : positiveFieldValidator(value),
                    }}
                  >
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor="prospect-fuel">{fuelConsumptionLabel(engineType)}</Label>
                        <Input
                          id="prospect-fuel"
                          type="number"
                          min={0}
                          step="0.1"
                          value={field.state.value ?? ''}
                          onChange={(event) =>
                            field.handleChange(parseOptionalNumber(event.target.value))
                          }
                        />
                        {fieldError(field.state.meta.errors) ? (
                          <p className="text-sm text-destructive">
                            {fieldError(field.state.meta.errors)}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </form.Field>
                ) : null
              }
            </form.Subscribe>
          </FormSection>

          <FormSection title={sv.prospects.sections.equipment}>
            <form.Field name="freeTextTagsInput">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="prospect-tags">{sv.prospects.freeTextTags}</Label>
                  <Input
                    id="prospect-tags"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Panoramatak, Dragkrok"
                  />
                </div>
              )}
            </form.Field>

            {equipmentCatalog === undefined ? (
              <p className="text-sm text-muted-foreground">{sv.common.loading}</p>
            ) : equipmentCatalog.length === 0 ? (
              <p className="text-sm text-muted-foreground">{sv.prospects.equipmentEmpty}</p>
            ) : (
              <ul className="grid gap-2">
                {equipmentCatalog.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {equipmentCategoryLabel(item.category)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <EquipmentPriorityBadge priority={item.priority} />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 rounded border border-input"
                          checked={equipmentIsPresent(item._id)}
                          onChange={(event) => setEquipmentPresent(item._id, event.target.checked)}
                        />
                        {sv.prospects.equipmentPresent}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </FormSection>

          <FormSection title={sv.prospects.sections.links}>
            <form.Field name="sourceLinks" mode="array">
              {(field) => (
                <div className="grid gap-3">
                  {field.state.value.map((link, index) => (
                    <div
                      key={link.clientKey}
                      className="grid gap-2 rounded-md border border-border p-3"
                    >
                      <form.Field name={`sourceLinks[${index}].title`}>
                        {(linkField) => (
                          <Input
                            placeholder={sv.prospects.linkTitle}
                            value={linkField.state.value}
                            onChange={(event) => linkField.handleChange(event.target.value)}
                          />
                        )}
                      </form.Field>
                      <form.Field
                        name={`sourceLinks[${index}].url`}
                        validators={{
                          onChange: ({ value }) => {
                            const trimmed = value.trim()
                            if (trimmed.length === 0) {
                              return m.urlRequired
                            }
                            return isValidHttpUrl(trimmed) ? undefined : m.invalidUrl
                          },
                        }}
                      >
                        {(linkField) => (
                          <div className="grid gap-1">
                            <Input
                              placeholder={sv.prospects.linkUrl}
                              value={linkField.state.value}
                              onChange={(event) => linkField.handleChange(event.target.value)}
                              onBlur={linkField.handleBlur}
                            />
                            {fieldError(linkField.state.meta.errors) ? (
                              <p className="text-sm text-destructive">
                                {fieldError(linkField.state.meta.errors)}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </form.Field>
                      <form.Field name={`sourceLinks[${index}].description`}>
                        {(linkField) => (
                          <Input
                            placeholder={sv.prospects.linkDescription}
                            value={linkField.state.value ?? ''}
                            onChange={(event) => linkField.handleChange(event.target.value)}
                          />
                        )}
                      </form.Field>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-fit"
                        onClick={() => field.removeValue(index)}
                      >
                        <Trash2 />
                        {sv.common.delete}
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => field.pushValue(newSourceLink())}
                  >
                    <Plus />
                    {sv.prospects.addLink}
                  </Button>
                </div>
              )}
            </form.Field>
          </FormSection>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? sv.common.loading : sv.common.save}
              </Button>
            )}
          </form.Subscribe>
        </form>
      )}
    </FormDrawer>
  )
}

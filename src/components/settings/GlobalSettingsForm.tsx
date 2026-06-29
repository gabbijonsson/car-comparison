import { useForm } from '@tanstack/react-form'
import { useMutation } from 'convex/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { sv } from '~/lib/i18n/sv'
import { toast } from '~/lib/toast'
import { fieldError, firstZodIssue } from '~/lib/validation/form'
import {
  annualKmFieldValidator,
  dieselPriceFieldValidator,
  type GlobalSettingsInput,
  globalSettingsSchema,
  hybridFuelPercentFieldValidator,
  hybridKwhFieldValidator,
  hybridLitersFieldValidator,
  kwhPriceFieldValidator,
  ownershipMonthsFieldValidator,
  petrolPriceFieldValidator,
} from '~/lib/validation/settings'
import { api } from '../../../convex/_generated/api'

type GlobalSettingsFormProps = {
  initialValues: GlobalSettingsInput
}

function parseNumberInput(value: string): number {
  const normalized = value.replace(',', '.')
  return Number(normalized)
}

export function GlobalSettingsForm({ initialValues }: GlobalSettingsFormProps) {
  const updateSettings = useMutation(api.settings.update)

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      const parsed = globalSettingsSchema.safeParse(value)
      if (!parsed.success) {
        toast.error(firstZodIssue(parsed.error))
        return
      }

      try {
        await updateSettings(parsed.data)
        toast.success(sv.settings.saved)
      } catch {
        toast.error()
      }
    },
  })

  return (
    <form
      className="grid max-w-xl gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="annualKm"
        validators={{ onChange: ({ value }) => annualKmFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="annualKm">{sv.settings.annualKm}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="annualKm"
                type="number"
                min={1}
                step={1}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">{sv.settings.units.km}</span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="petrolPriceSekPerLiter"
        validators={{ onChange: ({ value }) => petrolPriceFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="petrolPrice">{sv.settings.petrolPrice}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="petrolPrice"
                type="number"
                min={0.01}
                step={0.01}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">{sv.settings.units.sekPerLiter}</span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="dieselPriceSekPerLiter"
        validators={{ onChange: ({ value }) => dieselPriceFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="dieselPrice">{sv.settings.dieselPrice}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="dieselPrice"
                type="number"
                min={0.01}
                step={0.01}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">{sv.settings.units.sekPerLiter}</span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="kwhPriceSekPerKwh"
        validators={{ onChange: ({ value }) => kwhPriceFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="kwhPrice">{sv.settings.kwhPrice}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="kwhPrice"
                type="number"
                min={0.01}
                step={0.01}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">{sv.settings.units.sekPerKwh}</span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="hybridFuelPercent"
        validators={{ onChange: ({ value }) => hybridFuelPercentFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="hybridFuelPercent">{sv.settings.hybridFuelPercent}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="hybridFuelPercent"
                type="number"
                min={0}
                max={100}
                step={1}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">{sv.settings.units.percent}</span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="hybridLitersPerMil"
        validators={{ onChange: ({ value }) => hybridLitersFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="hybridLitersPerMil">{sv.settings.hybridLitersPerMil}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="hybridLitersPerMil"
                type="number"
                min={0.01}
                step={0.01}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">
                {sv.settings.units.litersPerMil}
              </span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="hybridKwhPerMil"
        validators={{ onChange: ({ value }) => hybridKwhFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="hybridKwhPerMil">{sv.settings.hybridKwhPerMil}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="hybridKwhPerMil"
                type="number"
                min={0.01}
                step={0.01}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">{sv.settings.units.kwhPerMil}</span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="ownershipMonths"
        validators={{ onChange: ({ value }) => ownershipMonthsFieldValidator(value) }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="ownershipMonths">{sv.settings.ownershipMonths}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ownershipMonths"
                type="number"
                min={1}
                step={1}
                value={field.state.value}
                onChange={(event) => field.handleChange(parseNumberInput(event.target.value))}
                onBlur={field.handleBlur}
              />
              <span className="text-sm text-muted-foreground">{sv.settings.units.months}</span>
            </div>
            {fieldError(field.state.meta.errors) ? (
              <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? sv.common.loading : sv.common.save}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

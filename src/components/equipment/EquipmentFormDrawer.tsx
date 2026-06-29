import { useForm } from '@tanstack/react-form'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
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
import {
  equipmentCategories,
  equipmentCategoryLabel,
  equipmentPriorities,
  equipmentPriorityLabel,
} from '~/lib/equipment/labels'
import type { EquipmentCategory, EquipmentPriority } from '~/lib/equipment/types'
import { sv } from '~/lib/i18n/sv'
import { fieldError, firstZodIssue } from '~/lib/validation/form'
import { validationMessages as m } from '~/lib/validation/messages'
import { type EquipmentFormInput, equipmentFormSchema } from '~/lib/validation/equipment'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type EquipmentFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipmentId?: Id<'equipment'>
  initialValues?: EquipmentFormInput
}

const defaultValues: EquipmentFormInput = {
  name: '',
  category: 'other',
  priority: 'neutral',
}

export function EquipmentFormDrawer({
  open,
  onOpenChange,
  equipmentId,
  initialValues = defaultValues,
}: EquipmentFormDrawerProps) {
  const createEquipment = useMutation(api.equipment.create)
  const updateEquipment = useMutation(api.equipment.update)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditing = equipmentId !== undefined

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const parsed = equipmentFormSchema.safeParse(value)
      if (!parsed.success) {
        setSubmitError(firstZodIssue(parsed.error))
        return
      }

      try {
        if (isEditing) {
          await updateEquipment({
            id: equipmentId,
            ...parsed.data,
          })
        } else {
          await createEquipment(parsed.data)
        }
        onOpenChange(false)
      } catch (cause: unknown) {
        const message = cause instanceof Error ? cause.message : sv.common.saveError
        setSubmitError(
          message === 'Utrustningen finns redan' ? sv.equipment.duplicateError : message,
        )
      }
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(initialValues)
      setSubmitError(null)
    }
  }, [open, initialValues, form])

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? sv.equipment.edit : sv.equipment.add}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (value.trim().length === 0 ? m.nameRequired : undefined),
          }}
        >
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="equipment-name">{sv.equipment.name}</Label>
              <Input
                id="equipment-name"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              {fieldError(field.state.meta.errors) ? (
                <p className="text-sm text-destructive">{fieldError(field.state.meta.errors)}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="equipment-category">{sv.equipment.category}</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as EquipmentCategory)}
              >
                <SelectTrigger id="equipment-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipmentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {equipmentCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="priority">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="equipment-priority">{sv.equipment.priority}</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as EquipmentPriority)}
              >
                <SelectTrigger id="equipment-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipmentPriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {equipmentPriorityLabel(priority)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

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
    </FormDrawer>
  )
}

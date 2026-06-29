import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'
import type { Id } from '../../../convex/_generated/dataModel'

type ProspectOption = {
  id: Id<'prospects'>
  title: string
  brand: string
  model: string
}

type ProspectPickerProps = {
  options: ProspectOption[]
  selectedIds: Id<'prospects'>[]
  onChange: (ids: Id<'prospects'>[]) => void
}

export function ProspectPicker({ options, selectedIds, onChange }: ProspectPickerProps) {
  const selectedSet = new Set(selectedIds)

  function toggle(id: Id<'prospects'>) {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id))
      return
    }
    onChange([...selectedIds, id])
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{sv.compare.pickerTitle}</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(options.map((option) => option.id))}
          >
            {sv.compare.selectAll}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([])}>
            {sv.compare.clearAll}
          </Button>
        </div>
      </div>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">{sv.compare.noActiveProspects}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => {
            const checked = selectedSet.has(option.id)
            return (
              <li key={option.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    onChange={() => toggle(option.id)}
                  />
                  <span>
                    <span className="block font-medium">{option.title}</span>
                    <span className="text-muted-foreground">
                      {option.brand} {option.model}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

import { useMutation } from 'convex/react'
import { Ban } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type VetoButtonProps = {
  prospectId: Id<'prospects'>
  active: boolean
  vetoNames?: string[]
  size?: 'default' | 'icon-sm'
}

function WithAttribution({
  label,
  names,
  children,
}: {
  label: string
  names: string[]
  children: ReactNode
}) {
  if (names.length === 0) {
    return children
  }

  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent align="start">
        <p className="mb-2 font-medium">{label}</p>
        <ul className="grid gap-1 text-muted-foreground">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export function VetoButton({
  prospectId,
  active,
  vetoNames = [],
  size = 'default',
}: VetoButtonProps) {
  const toggleVeto = useMutation(api.social.toggleVeto)

  const button =
    size === 'icon-sm' ? (
      <Button
        variant={active ? 'destructive' : 'ghost'}
        size="icon-sm"
        aria-label={active ? sv.detail.vetoActive : sv.detail.vetoToggle}
        onClick={() => void toggleVeto({ prospectId })}
      >
        <Ban />
      </Button>
    ) : (
      <Button
        variant={active ? 'destructive' : 'outline'}
        aria-label={sv.detail.vetoToggle}
        onClick={() => void toggleVeto({ prospectId })}
      >
        <Ban data-icon="inline-start" />
        {active ? sv.detail.vetoActive : sv.detail.veto}
      </Button>
    )

  return (
    <WithAttribution label={sv.detail.attributionVetoes} names={vetoNames}>
      {button}
    </WithAttribution>
  )
}

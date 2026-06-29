import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { EquipmentWarningBadge } from '~/components/equipment/EquipmentWarningBadge'
import { NiceToHaveIndicator } from '~/components/equipment/NiceToHaveIndicator'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { ComparisonProspect } from '~/lib/comparison/buildComparisonProspects'
import { sv } from '~/lib/i18n/sv'
import { cn } from '~/lib/utils'

type ComparisonCardsProps = {
  prospects: ComparisonProspect[]
}

type SectionConfig = {
  id: string
  title: string
  fields: Array<{ label: string; value: (prospect: ComparisonProspect) => ReactNode }>
}

function buildSections(): SectionConfig[] {
  const f = sv.compare.fields
  const s = sv.compare.sections

  return [
    {
      id: 'identity',
      title: s.identity,
      fields: [
        { label: f.title, value: (p) => p.title },
        { label: f.brandModel, value: (p) => `${p.brand} ${p.model}` },
        { label: f.modelYear, value: (p) => p.modelYear },
        { label: f.mileage, value: (p) => p.mileage },
        { label: f.engineType, value: (p) => p.engineType },
        { label: f.purchaseMethod, value: (p) => p.purchaseMethod },
      ],
    },
    {
      id: 'price',
      title: s.price,
      fields: [
        { label: f.buyPrice, value: (p) => p.buyPriceSek },
        { label: f.completionTotal, value: (p) => p.completionItemsTotal },
        { label: f.completionUpfront, value: (p) => p.completionItemsUpfront },
      ],
    },
    {
      id: 'financing',
      title: s.financing,
      fields: [
        { label: f.handpenning, value: (p) => p.handpenning },
        { label: f.monthlyPayment, value: (p) => p.monthlyPayment },
        { label: f.interestRate, value: (p) => p.interestRate },
        { label: f.monthlyAdminFee, value: (p) => p.monthlyAdminFee },
        { label: f.yearlyFee, value: (p) => p.yearlyFee },
        { label: f.periodMonths, value: (p) => p.periodMonths },
        { label: f.restValue, value: (p) => p.restValue },
      ],
    },
    {
      id: 'running',
      title: s.running,
      fields: [
        { label: f.insurance, value: (p) => p.insuranceMonthly },
        { label: f.tax, value: (p) => p.taxYearly },
        { label: f.serviceSmall, value: (p) => p.serviceSmall },
        { label: f.serviceBig, value: (p) => p.serviceBig },
        { label: f.serviceInterval, value: (p) => p.serviceInterval },
        { label: f.fuelConsumption, value: (p) => p.fuelConsumption },
        { label: f.energyMonthly, value: (p) => p.energyMonthly },
      ],
    },
    {
      id: 'totals',
      title: s.totals,
      fields: [
        { label: f.total3yr, value: (p) => p.total3yr },
        { label: f.total5yr, value: (p) => p.total5yr },
        { label: f.total10yr, value: (p) => p.total10yr },
      ],
    },
    {
      id: 'equipment',
      title: s.equipment,
      fields: [
        {
          label: f.missingMustHave,
          value: (p) => <EquipmentWarningBadge missing={p.missingMustHave} />,
        },
        {
          label: f.includedNiceToHave,
          value: (p) => <NiceToHaveIndicator included={p.includedNiceToHave} />,
        },
      ],
    },
    {
      id: 'social',
      title: s.social,
      fields: [
        { label: f.rating, value: (p) => p.avgScore },
        {
          label: f.veto,
          value: (p) =>
            p.vetoCount === 0 ? (
              '—'
            ) : (
              <span className="inline-flex items-center gap-2">
                {p.vetoCount}
                {p.hasVeto ? <Badge variant="destructive">{sv.dashboard.vetoBadge}</Badge> : null}
              </span>
            ),
        },
      ],
    },
    {
      id: 'links',
      title: s.links,
      fields: [
        {
          label: f.sourceLinks,
          value: (p) =>
            p.links.length === 0 ? (
              '—'
            ) : (
              <ul className="grid gap-1">
                {p.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            ),
        },
      ],
    },
  ]
}

const sections = buildSections()

export function ComparisonCards({ prospects }: ComparisonCardsProps) {
  return (
    <div className="grid gap-4">
      {prospects.map((prospect) => (
        <Card key={prospect.id}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{prospect.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {prospect.brand} {prospect.model}
                </p>
              </div>
              {prospect.hasVeto ? (
                <Badge variant="destructive">{sv.dashboard.vetoBadge}</Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {sections.map((section) => (
              <details key={section.id} className="group rounded-lg border border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 font-medium">
                  {section.title}
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground transition-transform group-open:rotate-180',
                    )}
                  />
                </summary>
                <dl className="grid gap-2 border-t border-border px-3 py-3 text-sm">
                  {section.fields.map((field) => (
                    <div key={field.label} className="grid gap-0.5">
                      <dt className="text-muted-foreground">{field.label}</dt>
                      <dd>{field.value(prospect)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

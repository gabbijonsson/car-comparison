import { ExternalLink } from 'lucide-react'
import { EquipmentPriorityBadge } from '~/components/equipment/EquipmentPriorityBadge'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import type { ComparisonProspect } from '~/lib/comparison/buildComparisonProspects'
import { equipmentCategoryLabel } from '~/lib/equipment/labels'
import { formatSek } from '~/lib/format'
import { sv } from '~/lib/i18n/sv'
import type { Doc } from '../../../convex/_generated/dataModel'

type EquipmentEntry = {
  _id: Doc<'equipment'>['_id']
  name: string
  category: Doc<'equipment'>['category']
  priority: Doc<'equipment'>['priority']
}

type ProspectDetailSectionsProps = {
  formatted: ComparisonProspect
  prospect: Doc<'prospects'>
  equipment: EquipmentEntry[]
  purchaseItems: Doc<'purchaseItems'>[]
  sourceLinks: Doc<'sourceLinks'>[]
}

function FieldGrid({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="mt-0.5 font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ProspectDetailSections({
  formatted,
  prospect,
  equipment,
  purchaseItems,
  sourceLinks,
}: ProspectDetailSectionsProps) {
  const identityRows = [
    { label: sv.compare.fields.brandModel, value: `${formatted.brand} ${formatted.model}` },
    { label: sv.compare.fields.modelYear, value: formatted.modelYear },
    { label: sv.prospects.registrationYear, value: String(prospect.registrationYear ?? '—') },
    { label: sv.compare.fields.mileage, value: formatted.mileage },
    { label: sv.compare.fields.engineType, value: formatted.engineType },
    { label: sv.compare.fields.purchaseMethod, value: formatted.purchaseMethod },
    { label: sv.compare.fields.buyPrice, value: formatted.buyPriceSek },
  ]

  const runningRows = [
    { label: sv.compare.fields.insurance, value: formatted.insuranceMonthly },
    { label: sv.compare.fields.tax, value: formatted.taxYearly },
    { label: sv.compare.fields.serviceSmall, value: formatted.serviceSmall },
    { label: sv.compare.fields.serviceBig, value: formatted.serviceBig },
    { label: sv.compare.fields.serviceInterval, value: formatted.serviceInterval },
    { label: sv.compare.fields.fuelConsumption, value: formatted.fuelConsumption },
    { label: sv.compare.fields.energyMonthly, value: formatted.energyMonthly },
  ]

  const financingRows =
    prospect.purchaseMethod === 'financed'
      ? [
          { label: sv.compare.fields.handpenning, value: formatted.handpenning },
          { label: sv.compare.fields.monthlyPayment, value: formatted.monthlyPayment },
          { label: sv.compare.fields.interestRate, value: formatted.interestRate },
          { label: sv.compare.fields.monthlyAdminFee, value: formatted.monthlyAdminFee },
          { label: sv.compare.fields.yearlyFee, value: formatted.yearlyFee },
          { label: sv.compare.fields.periodMonths, value: formatted.periodMonths },
          { label: sv.compare.fields.restValue, value: formatted.restValue },
        ]
      : []

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{sv.prospects.sections.identity}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FieldGrid rows={identityRows} />
          {prospect.packageDescription ? (
            <div>
              <p className="text-sm text-muted-foreground">{sv.detail.packageDescription}</p>
              <p className="mt-1 whitespace-pre-wrap">{prospect.packageDescription}</p>
            </div>
          ) : null}
          {prospect.freeTextEquipmentTags.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground">{sv.detail.freeTextTags}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {prospect.freeTextEquipmentTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {prospect.purchaseMethod === 'financed' ? (
        <Card>
          <CardHeader>
            <CardTitle>{sv.detail.financing}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGrid rows={financingRows} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{sv.detail.runningCosts}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGrid rows={runningRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{sv.detail.equipment}</CardTitle>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground">{sv.detail.noEquipment}</p>
          ) : (
            <ul className="grid gap-2">
              {equipment.map((item) => (
                <li
                  key={item._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {equipmentCategoryLabel(item.category)}
                    </p>
                  </div>
                  <EquipmentPriorityBadge priority={item.priority} />
                </li>
              ))}
            </ul>
          )}
          {formatted.missingMustHave.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-destructive">{sv.compare.missingMustHave}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {formatted.missingMustHave.map((item) => (
                  <Badge key={item._id} variant="destructive">
                    {item.name}
                  </Badge>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{sv.detail.purchaseItems}</CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">{sv.detail.noPurchaseItems}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{sv.prospects.purchaseItemTitle}</TableHead>
                  <TableHead>{sv.prospects.purchaseItemCost}</TableHead>
                  <TableHead>{sv.prospects.purchaseItemUpfront}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatSek(item.costSek)}
                    </TableCell>
                    <TableCell>
                      {item.paidUpfront ? sv.detail.upfront : sv.detail.financedLater}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{sv.detail.sourceLinks}</CardTitle>
        </CardHeader>
        <CardContent>
          {sourceLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{sv.detail.noLinks}</p>
          ) : (
            <ul className="grid gap-3">
              {sourceLinks.map((link) => (
                <li key={link._id} className="rounded-lg border border-border px-4 py-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    {link.title}
                    <ExternalLink className="size-3.5" />
                  </a>
                  {link.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                  ) : null}
                  <p className="mt-1 truncate text-xs text-muted-foreground">{link.url}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

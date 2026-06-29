export type ActivityEventType =
  | 'create'
  | 'update'
  | 'archive'
  | 'delete'
  | 'note'
  | 'rating'
  | 'veto'
  | 'reminder'
  | 'link'
  | 'equipment'
  | 'settings'

export type ActivityMessageContext = {
  type: ActivityEventType
  actorName: string | null
  prospectTitle: string | null
  metadata?: Record<string, string | number | boolean | null> | null
  storedMessage?: string
}

function actorLabel(name: string | null): string {
  return name?.trim() || 'Någon'
}

function carLabel(title: string | null): string {
  return title?.trim() || 'okänd bil'
}

function isRemoveAction(ctx: ActivityMessageContext): boolean {
  if (ctx.metadata?.action === 'remove') {
    return true
  }
  return ctx.storedMessage?.includes('togs bort') ?? false
}

export const ACTIVITY_SV: Record<
  ActivityEventType,
  (ctx: ActivityMessageContext) => string
> = {
  create: (ctx) => `${actorLabel(ctx.actorName)} lade till bil: ${carLabel(ctx.prospectTitle)}`,
  update: (ctx) =>
    `${actorLabel(ctx.actorName)} uppdaterade bil: ${carLabel(ctx.prospectTitle)}`,
  archive: (ctx) =>
    `${actorLabel(ctx.actorName)} arkiverade bil: ${carLabel(ctx.prospectTitle)}`,
  delete: (ctx) => `${actorLabel(ctx.actorName)} tog bort bil: ${carLabel(ctx.prospectTitle)}`,
  note: (ctx) =>
    isRemoveAction(ctx)
      ? `${actorLabel(ctx.actorName)} tog bort anteckning på ${carLabel(ctx.prospectTitle)}`
      : `${actorLabel(ctx.actorName)} lade till anteckning på ${carLabel(ctx.prospectTitle)}`,
  rating: (ctx) => {
    const score = ctx.metadata?.score
    if (typeof score === 'number') {
      return `${actorLabel(ctx.actorName)} satte betyg ${score}/5 på ${carLabel(ctx.prospectTitle)}`
    }
    return `${actorLabel(ctx.actorName)} satte betyg på ${carLabel(ctx.prospectTitle)}`
  },
  veto: (ctx) =>
    isRemoveAction(ctx)
      ? `${actorLabel(ctx.actorName)} tog bort veto på ${carLabel(ctx.prospectTitle)}`
      : `${actorLabel(ctx.actorName)} satte veto på ${carLabel(ctx.prospectTitle)}`,
  reminder: (ctx) =>
    isRemoveAction(ctx)
      ? `${actorLabel(ctx.actorName)} tog bort påminnelse för ${carLabel(ctx.prospectTitle)}`
      : `${actorLabel(ctx.actorName)} satte påminnelse för ${carLabel(ctx.prospectTitle)}`,
  link: (ctx) => {
    const car = carLabel(ctx.prospectTitle)
    if (isRemoveAction(ctx)) {
      const linkTitle =
        typeof ctx.metadata?.linkTitle === 'string' ? ctx.metadata.linkTitle.trim() : null
      return linkTitle
        ? `${actorLabel(ctx.actorName)} tog bort länken "${linkTitle}" till ${car}`
        : `${actorLabel(ctx.actorName)} tog bort länk till ${car}`
    }
    return `${actorLabel(ctx.actorName)} lade till länk till ${car}`
  },
  equipment: (ctx) => {
    const name =
      typeof ctx.metadata?.equipmentName === 'string'
        ? ctx.metadata.equipmentName.trim()
        : extractQuotedName(ctx.storedMessage) ?? 'utrustning'
    const rawAction = ctx.metadata?.action
    const action =
      rawAction === 'remove' || rawAction === 'update' || rawAction === 'add'
        ? rawAction
        : inferEquipmentAction(ctx.storedMessage)

    if (action === 'remove') {
      return `${actorLabel(ctx.actorName)} tog bort utrustningen "${name}"`
    }
    if (action === 'update') {
      return `${actorLabel(ctx.actorName)} uppdaterade utrustningen "${name}"`
    }
    return `${actorLabel(ctx.actorName)} lade till utrustningen "${name}"`
  },
  settings: (ctx) => {
    if (ctx.metadata?.action === 'create' || ctx.storedMessage?.includes('skapades')) {
      return `${actorLabel(ctx.actorName)} skapade globala inställningar`
    }
    return `${actorLabel(ctx.actorName)} uppdaterade globala inställningar`
  },
}

function extractQuotedName(message: string | undefined): string | null {
  if (message === undefined) {
    return null
  }
  const match = message.match(/"([^"]+)"/)
  return match?.[1] ?? null
}

function inferEquipmentAction(
  message: string | undefined,
): 'add' | 'update' | 'remove' {
  if (message?.includes('togs bort')) {
    return 'remove'
  }
  if (message?.includes('uppdaterades')) {
    return 'update'
  }
  return 'add'
}

export function formatActivityMessage(ctx: ActivityMessageContext): string {
  return ACTIVITY_SV[ctx.type](ctx)
}

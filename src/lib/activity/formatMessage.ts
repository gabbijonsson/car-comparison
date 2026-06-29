type ActivityEventLike = {
  type: string
  message: string
  actorName: string | null
  prospectTitle: string | null
  metadata?: Record<string, string | number | boolean | null> | null
}

function actorLabel(name: string | null): string {
  return name?.trim() || 'Någon'
}

function onCar(title: string | null): string {
  return title ? ` på ${title}` : ''
}

export function formatActivityMessage(event: ActivityEventLike): string {
  const actor = actorLabel(event.actorName)
  const car = onCar(event.prospectTitle)

  switch (event.type) {
    case 'rating': {
      const score = event.metadata?.score
      if (typeof score === 'number') {
        return `${actor} satte betyg ${score}/5${car}`
      }
      break
    }
    case 'veto':
      return event.message.includes('togs bort')
        ? `${actor} tog bort veto${car}`
        : `${actor} satte veto${car}`
    case 'reminder':
      return event.message.includes('togs bort')
        ? `${actor} tog bort påminnelse${car}`
        : `${actor} satte påminnelse${car}`
    case 'note':
      return event.message.includes('togs bort')
        ? `${actor} tog bort anteckning${car}`
        : `${actor} lade till anteckning${car}`
    case 'create':
      return `${actor} lade till bil${car.replace(' på ', ': ')}`
    case 'archive':
      return `${actor} arkiverade bil${car.replace(' på ', ': ')}`
    case 'delete':
      return `${actor} tog bort bil${car.replace(' på ', ': ')}`
    case 'update':
      return `${actor} uppdaterade bil${car.replace(' på ', ': ')}`
    case 'settings':
      return event.message
    case 'equipment':
      return event.message
    default:
      break
  }

  return event.message
}

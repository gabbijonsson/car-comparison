import { describe, expect, it } from 'vitest'
import { formatActivityMessage } from './messages'

describe('formatActivityMessage', () => {
  it('renders link add with actor and car title', () => {
    expect(
      formatActivityMessage({
        type: 'link',
        actorName: 'Erik',
        prospectTitle: 'Skoda Enyaq',
        metadata: { linkTitle: 'Blocket', action: 'add' },
      }),
    ).toBe('Erik lade till länk till Skoda Enyaq')
  })

  it('renders rating with score', () => {
    expect(
      formatActivityMessage({
        type: 'rating',
        actorName: 'Anna',
        prospectTitle: 'Volvo V60',
        metadata: { score: 4 },
      }),
    ).toBe('Anna satte betyg 4/5 på Volvo V60')
  })

  it('renders settings update with actor', () => {
    expect(
      formatActivityMessage({
        type: 'settings',
        actorName: 'Erik',
        prospectTitle: null,
        metadata: { action: 'update' },
      }),
    ).toBe('Erik uppdaterade globala inställningar')
  })

  it('falls back to stored message patterns for legacy veto remove', () => {
    expect(
      formatActivityMessage({
        type: 'veto',
        actorName: 'Erik',
        prospectTitle: 'BMW 530e',
        storedMessage: 'Veto togs bort',
      }),
    ).toBe('Erik tog bort veto på BMW 530e')
  })
})

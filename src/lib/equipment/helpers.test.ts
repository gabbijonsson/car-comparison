import { describe, expect, it } from 'vitest'
import type { Id } from '../../../convex/_generated/dataModel'
import { type EquipmentCatalogEntry, includedNiceToHave, missingMustHave } from './helpers'

const eq = (
  id: string,
  priority: 'must' | 'nice' | 'neutral',
  name = id,
): EquipmentCatalogEntry => ({
  _id: id as Id<'equipment'>,
  name,
  priority,
})

describe('missingMustHave', () => {
  it('returns must-have items not marked present', () => {
    const catalog = [eq('a', 'must', 'Dragkrok'), eq('b', 'nice', 'Skinn'), eq('c', 'must', 'ACC')]
    const joins = [
      { equipmentId: 'a' as Id<'equipment'>, isPresent: true },
      { equipmentId: 'c' as Id<'equipment'>, isPresent: false },
    ]
    expect(missingMustHave(joins, catalog).map((item) => item.name)).toEqual(['ACC'])
  })

  it('ignores nice-to-have and neutral items', () => {
    const catalog = [eq('a', 'nice'), eq('b', 'neutral')]
    expect(missingMustHave([], catalog)).toEqual([])
  })
})

describe('includedNiceToHave', () => {
  it('returns nice-to-have items marked present', () => {
    const catalog = [eq('a', 'must'), eq('b', 'nice', 'Skinn'), eq('c', 'nice', 'Panorama')]
    const joins = [
      { equipmentId: 'b' as Id<'equipment'>, isPresent: true },
      { equipmentId: 'c' as Id<'equipment'>, isPresent: false },
    ]
    expect(includedNiceToHave(joins, catalog).map((item) => item.name)).toEqual(['Skinn'])
  })
})

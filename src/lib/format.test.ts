import { describe, expect, it } from 'vitest'
import { formatSek } from './format'

describe('formatSek', () => {
  it('formats Swedish currency', () => {
    expect(formatSek(600_000)).toMatch(/600\s?000/)
    expect(formatSek(600_000)).toContain('kr')
  })
})

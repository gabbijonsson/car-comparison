import { describe, expect, it } from 'vitest'
import {
  formatConsumption,
  formatDistance,
  formatPercent,
  formatSek,
} from './format'

describe('formatSek', () => {
  it('formats Swedish currency', () => {
    expect(formatSek(600_000)).toMatch(/600\s?000/)
    expect(formatSek(600_000)).toContain('kr')
  })
})

describe('formatDistance', () => {
  it('formats Swedish mil', () => {
    expect(formatDistance(12_500)).toMatch(/12\s?500/)
    expect(formatDistance(12_500)).toContain('mil')
  })
})

describe('formatConsumption', () => {
  it('formats liters per mil with up to one decimal', () => {
    expect(formatConsumption(0.8, 'liter')).toContain('L/mil')
    expect(formatConsumption(1.25, 'liter')).toMatch(/1,3|1\.3/)
  })

  it('formats kWh per mil', () => {
    expect(formatConsumption(2, 'kwh')).toContain('kWh/mil')
  })
})

describe('formatPercent', () => {
  it('formats percentage with Swedish spacing', () => {
    expect(formatPercent(5.5)).toMatch(/5,5 %|5\.5 %/)
  })
})

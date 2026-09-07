import { describe, expect, it } from 'vitest'
import { formatPayBy, isOverdue, payByFromPreset, type PayByPreset } from './payBy'

describe('payByFromPreset', () => {
  const now = new Date('2026-09-07T10:00:00.000Z')

  it('sets a one-hour window', () => {
    expect(payByFromPreset('1h', now)).toBe('2026-09-07T11:00:00.000Z')
  })

  it('sets end of the local day', () => {
    const end = new Date(payByFromPreset('today', now))
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.toDateString()).toBe(now.toDateString())
  })

  it.each<[PayByPreset, number]>([
    ['3d', 3],
    ['7d', 7],
    ['30d', 30],
  ])('adds %s calendar days', (preset, days) => {
    const result = new Date(payByFromPreset(preset, now))
    const expected = new Date(now)
    expected.setDate(expected.getDate() + days)
    expect(result.toISOString()).toBe(expected.toISOString())
  })
})

describe('isOverdue', () => {
  it('is overdue after the pay-by instant', () => {
    expect(isOverdue('2026-09-07T09:00:00.000Z', new Date('2026-09-07T10:00:00.000Z'))).toBe(true)
    expect(isOverdue('2026-09-07T11:00:00.000Z', new Date('2026-09-07T10:00:00.000Z'))).toBe(false)
  })
})

describe('formatPayBy', () => {
  it('names the pay-by deadline in plain language', () => {
    expect(formatPayBy('2026-09-07T18:30:00.000Z')).toMatch(/pay by/i)
  })
})

import { describe, expect, it } from 'vitest'
import { chartStats, compactInr, cumulativeSeries, densifySeries, sparkPath, yTicks } from './moneyGraph'

describe('cumulativeSeries', () => {
  it('starts from the opening balance and adds each posting', () => {
    expect(cumulativeSeries(100, [20, 30])).toEqual([100, 120, 150])
  })

  it('returns only the opening balance when there are no postings', () => {
    expect(cumulativeSeries(80, [])).toEqual([80])
  })
})

describe('sparkPath', () => {
  it('draws a rising line across the viewBox', () => {
    const d = sparkPath([10, 20, 40], 100, 40, 0)
    expect(d).toMatch(/^M 0\.0 40\.0/)
    expect(d).toContain('L 100.0 0.0')
  })

  it('keeps a flat line on the midline when values do not change', () => {
    expect(sparkPath([5, 5, 5], 100, 40, 0)).toBe('M 0.0 20.0 L 50.0 20.0 L 100.0 20.0')
  })
})

describe('densifySeries', () => {
  it('interpolates a short ledger into more samples', () => {
    expect(densifySeries([0, 100], 5)).toEqual([0, 25, 50, 75, 100])
  })
})

describe('chartStats', () => {
  it('reports min, max, mean and the net change', () => {
    expect(chartStats([10, 30, 20])).toEqual({
      min: 10,
      max: 30,
      mean: 20,
      first: 10,
      last: 20,
      change: 10,
    })
  })
})

describe('compactInr', () => {
  it('shortens large rupee ticks', () => {
    expect(compactInr(1240)).toBe('₹1.2k')
    expect(compactInr(18420)).toBe('₹18.4k')
  })
})

describe('yTicks', () => {
  it('returns a rising set of axis marks', () => {
    const ticks = yTicks(100, 400, 4)
    expect(ticks[0]).toBeLessThanOrEqual(100)
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(400)
    expect(ticks.length).toBeGreaterThan(2)
  })
})

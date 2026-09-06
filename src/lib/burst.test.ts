import { describe, expect, it } from 'vitest'
import { BURST_LIMITS, burstParticles } from './burst'

describe('burstParticles', () => {
  it('returns the requested number of particles', () => {
    expect(burstParticles(12, 7)).toHaveLength(12)
  })

  it('returns an empty list for non-positive counts', () => {
    expect(burstParticles(0, 1)).toEqual([])
    expect(burstParticles(-3, 1)).toEqual([])
  })

  it('is deterministic for the same seed', () => {
    expect(burstParticles(9, 42)).toEqual(burstParticles(9, 42))
  })

  it('produces different layouts for different seeds', () => {
    expect(burstParticles(9, 1)).not.toEqual(burstParticles(9, 2))
  })

  it('keeps every particle inside the declared limits', () => {
    for (const particle of burstParticles(24, 3)) {
      expect(particle.angle).toBeGreaterThanOrEqual(0)
      expect(particle.angle).toBeLessThan(360)
      expect(particle.distance).toBeGreaterThanOrEqual(BURST_LIMITS.minDistance)
      expect(particle.distance).toBeLessThanOrEqual(BURST_LIMITS.maxDistance)
      expect(particle.scale).toBeGreaterThanOrEqual(BURST_LIMITS.minScale)
      expect(particle.scale).toBeLessThanOrEqual(BURST_LIMITS.maxScale)
      expect(particle.delay).toBeGreaterThanOrEqual(0)
      expect(particle.delay).toBeLessThanOrEqual(BURST_LIMITS.maxDelay)
    }
  })

  it('spreads particles around the full circle', () => {
    const angles = burstParticles(8, 11).map((particle) => particle.angle)
    expect(Math.max(...angles) - Math.min(...angles)).toBeGreaterThan(180)
  })

  it('mixes coins and sparks', () => {
    const kinds = new Set(burstParticles(16, 5).map((particle) => particle.kind))
    expect(kinds.has('coin')).toBe(true)
    expect(kinds.has('spark')).toBe(true)
  })

  it('gives every particle a unique id', () => {
    const ids = burstParticles(20, 9).map((particle) => particle.id)
    expect(new Set(ids).size).toBe(20)
  })
})

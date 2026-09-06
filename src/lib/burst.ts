export type BurstKind = 'coin' | 'spark'

export interface BurstParticle {
  id: string
  angle: number
  distance: number
  scale: number
  delay: number
  spin: number
  kind: BurstKind
}

export const BURST_LIMITS = {
  minDistance: 48,
  maxDistance: 168,
  minScale: 0.55,
  maxScale: 1.25,
  maxDelay: 0.18,
  maxSpin: 240,
} as const

/** Mulberry32: small deterministic PRNG so a burst replays identically. */
function createRandom(seed: number): () => number {
  let state = (Math.trunc(seed) || 1) >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function lerp(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio
}

export function burstParticles(count: number, seed: number): BurstParticle[] {
  if (!Number.isFinite(count) || count <= 0) return []
  const random = createRandom(seed)
  const step = 360 / count

  return Array.from({ length: count }, (_, index) => {
    const jitter = (random() - 0.5) * step * 0.8
    const angle = (index * step + jitter + 360) % 360
    return {
      id: `burst-${seed}-${index}`,
      angle,
      distance: lerp(BURST_LIMITS.minDistance, BURST_LIMITS.maxDistance, random()),
      scale: lerp(BURST_LIMITS.minScale, BURST_LIMITS.maxScale, random()),
      delay: random() * BURST_LIMITS.maxDelay,
      spin: (random() - 0.5) * 2 * BURST_LIMITS.maxSpin,
      kind: index % 3 === 0 ? 'coin' : 'spark',
    }
  })
}

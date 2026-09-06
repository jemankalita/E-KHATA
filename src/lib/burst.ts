export type BurstKind = 'coin' | 'spark' | 'note'

export interface MoneyNote {
  id: string
  x: number
  drift: number
  rotate: number
  delay: number
  duration: number
  denom: 10 | 20 | 50 | 100 | 500
}

export const NOTE_LIMITS = {
  minX: -72,
  maxX: 72,
  minDrift: -28,
  maxDrift: 28,
  maxRotate: 28,
  maxDelay: 0.28,
  minDuration: 1.1,
  maxDuration: 1.8,
} as const

const DENOMS = [10, 20, 50, 100, 500] as const

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
      kind: index % 3 === 0 ? 'note' : index % 2 === 0 ? 'coin' : 'spark',
    }
  })
}

export function moneyNotes(count: number, seed: number): MoneyNote[] {
  if (!Number.isFinite(count) || count <= 0) return []
  const random = createRandom(seed + 17)
  return Array.from({ length: count }, (_, index) => ({
    id: `note-${seed}-${index}`,
    x: lerp(NOTE_LIMITS.minX, NOTE_LIMITS.maxX, random()),
    drift: lerp(NOTE_LIMITS.minDrift, NOTE_LIMITS.maxDrift, random()),
    rotate: (random() - 0.5) * 2 * NOTE_LIMITS.maxRotate,
    delay: random() * NOTE_LIMITS.maxDelay,
    duration: lerp(NOTE_LIMITS.minDuration, NOTE_LIMITS.maxDuration, random()),
    denom: DENOMS[index % DENOMS.length]!,
  }))
}

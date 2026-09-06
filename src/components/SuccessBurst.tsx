import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { burstParticles } from '../lib/burst'
import { motionTokens } from '../lib/motion-tokens'

const COIN_CLASS = 'h-3 w-3 rounded-full bg-gold-400 shadow-[0_0_0_1px_rgba(122,95,36,0.35)]'
const SPARK_CLASS = 'h-1.5 w-4 rounded-full bg-teal-300'

/**
 * One-shot celebration burst behind a committed amount. Purely decorative,
 * so it renders nothing when the user prefers reduced motion.
 */
export function SuccessBurst({ seed, count = 18 }: { seed: number; count?: number }) {
  const reduce = useReducedMotion()
  const particles = useMemo(() => burstParticles(count, seed), [count, seed])

  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible" aria-hidden="true">
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180
        return (
          <motion.span
            key={particle.id}
            className={`absolute ${particle.kind === 'coin' ? COIN_CLASS : SPARK_CLASS}`}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: Math.cos(radians) * particle.distance,
              y: Math.sin(radians) * particle.distance,
              scale: [0.3, particle.scale, particle.scale * 0.8],
              rotate: particle.spin,
            }}
            transition={{
              duration: motionTokens.duration.crawl,
              delay: particle.delay,
              ease: motionTokens.easing.smooth,
            }}
          />
        )
      })}
      <motion.span
        className="absolute h-24 w-24 rounded-full border border-teal-300/40"
        initial={{ opacity: 0.7, scale: 0.2 }}
        animate={{ opacity: 0, scale: 2.6 }}
        transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
      />
    </div>
  )
}

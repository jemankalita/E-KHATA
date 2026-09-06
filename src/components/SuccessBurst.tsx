import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { moneyNotes } from '../lib/burst'
import { motionTokens } from '../lib/motion-tokens'

/**
 * Rocket-style money notes: notes launch upward from the payment mark.
 * Decorative only — hidden when the user prefers reduced motion.
 */
export function SuccessBurst({ seed, count = 14 }: { seed: number; count?: number }) {
  const reduce = useReducedMotion()
  const notes = useMemo(() => moneyNotes(count, seed), [count, seed])

  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible" aria-hidden="true">
      <motion.span
        className="absolute h-28 w-1 rounded-full bg-cyan-signal/70"
        initial={{ opacity: 0.8, scaleY: 0.2, y: 24 }}
        animate={{ opacity: 0, scaleY: 3.4, y: -80 }}
        transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
      />
      {notes.map((note) => (
        <motion.span
          key={note.id}
          className="absolute flex h-8 w-14 items-center justify-center rounded-[3px] bg-[#2f7a4a] text-[9px] font-medium uppercase tracking-wide text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
          initial={{ opacity: 0, x: note.x, y: 28, rotate: 0, scale: 0.7 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: note.x + note.drift,
            y: -150,
            rotate: note.rotate,
            scale: 1,
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            ease: motionTokens.easing.smooth,
          }}
        >
          ₹{note.denom}
        </motion.span>
      ))}
    </div>
  )
}

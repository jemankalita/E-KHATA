import { useEffect, useMemo, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { motionTokens, springs } from '../lib/motion-tokens'

function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function DigitReel({ digit, reduce }: { digit: number; reduce: boolean }) {
  if (reduce) return <span className="inline-block w-[0.62em] text-center">{digit}</span>
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        animate={{ y: `${-digit}em` }}
        transition={springs.snappy}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="flex h-[1em] items-center justify-center">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

/**
 * Digit-reel money counter. Each reel keeps its DOM node across renders and is
 * keyed by position from the right, so a balance change rolls the old digits to
 * the new ones instead of snapping.
 */
export function RockerMoney({
  amount,
  className,
  label,
}: {
  amount: number
  className?: string
  label?: string
}) {
  const reduce = useReducedMotion()
  const chars = useMemo(() => formatRupees(amount).split(''), [amount])
  const tilt = useMotionValue(0)
  const rotateX = useTransform(tilt, [0, 1], [0, 16])
  const previous = useRef(amount)

  useEffect(() => {
    const changed = previous.current !== amount
    previous.current = amount
    if (!changed || reduce) return
    const controls = animate(tilt, [0, 1, 0], {
      duration: motionTokens.duration.slow,
      ease: motionTokens.easing.smooth,
    })
    return () => controls.stop()
  }, [amount, reduce, tilt])

  return (
    <motion.p
      style={reduce ? undefined : { rotateX, transformPerspective: 900 }}
      className={`rocker-money font-display tabular tracking-tight ${className ?? ''}`}
      aria-label={label ? `${label}: ${formatRupees(amount)}` : formatRupees(amount)}
    >
      <span aria-hidden="true" className="inline-flex items-end">
        {chars.map((char, index) => {
          const key = `pos-${chars.length - index}`
          const digit = Number(char)
          if (Number.isNaN(digit) || char === ' ') {
            return (
              <span key={key} className="px-[0.03em]">
                {char}
              </span>
            )
          }
          return <DigitReel key={key} digit={digit} reduce={Boolean(reduce)} />
        })}
      </span>
    </motion.p>
  )
}

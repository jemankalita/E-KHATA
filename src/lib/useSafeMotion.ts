import { useReducedMotion } from 'motion/react'
import { motionTokens } from './motion-tokens'

export interface SafeMotionProps {
  initial: { opacity: number; y: number }
  animate: { opacity: number; y: number }
  exit: { opacity: number; y: number }
}

/**
 * Entrance/exit props that collapse to an opacity-only fade when the user
 * asks for reduced motion. Only transform/opacity are ever animated.
 */
export function useSafeMotion(distance: number = motionTokens.distance.md): SafeMotionProps {
  const reduce = useReducedMotion()
  const y = reduce ? 0 : distance
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -distance },
  }
}

/** Stagger container variants; interval stays inside the 0.05–0.10s band. */
export function staggerContainer(stagger = 0.07, delayChildren = 0.04) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

export function useStaggerItem(distance: number = motionTokens.distance.md) {
  const reduce = useReducedMotion()
  return {
    hidden: { opacity: 0, y: reduce ? 0 : distance },
    visible: { opacity: 1, y: 0 },
  }
}

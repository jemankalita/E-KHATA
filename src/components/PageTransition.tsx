import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { motionTokens } from '../lib/motion-tokens'

/**
 * Enter-only route transition. An exit animation would need AnimatePresence to
 * hold the old subtree, but the router has already swapped the Outlet content
 * by then, so the leaving node would animate the *new* page out.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const reduce = useReducedMotion()

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: reduce ? 0 : motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? motionTokens.duration.fast : motionTokens.duration.normal,
        ease: motionTokens.easing.smooth,
      }}
    >
      {children}
    </motion.div>
  )
}

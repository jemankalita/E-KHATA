import { motion, useReducedMotion } from 'motion/react'
import { motionTokens } from '../lib/motion-tokens'

export function Icon3D({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const reduce = useReducedMotion()
  const classes = `pointer-events-none select-none drop-shadow-2xl ${className ?? ''}`

  if (reduce) return <img src={src} alt={alt} className={classes} />

  return (
    <motion.img
      src={src}
      alt={alt}
      className={classes}
      style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateY: [-8, 8, -8], y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 6, ease: motionTokens.easing.smooth }}
    />
  )
}

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

export function AnimatedNumber({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (latest) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(latest)),
  )

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.85, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [mv, value])

  return <motion.span className={className}>{text}</motion.span>
}

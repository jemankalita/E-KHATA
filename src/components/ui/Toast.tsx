import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'
import { motionTokens, springs } from '../../lib/motion-tokens'

const icons = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
}

const tones = {
  success: 'border-teal-400/35 text-teal-500',
  error: 'border-rose-600/35 text-rose-800',
  info: 'border-black/10 text-paper-100',
}

export function Toast({
  message,
  tone,
  onDismiss,
}: {
  message: string
  tone: 'success' | 'error' | 'info'
  onDismiss: () => void
}) {
  const reduce = useReducedMotion()
  const Icon = icons[tone]

  useEffect(() => {
    const id = window.setTimeout(onDismiss, 3600)
    return () => window.clearTimeout(id)
  }, [onDismiss])

  const offset = reduce ? 0 : motionTokens.distance.lg

  return (
    <AnimatePresence>
      <motion.div
        key={message}
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: offset, scale: reduce ? 1 : motionTokens.scale.subtle }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: offset, scale: reduce ? 1 : motionTokens.scale.subtle }}
        transition={springs.snappy}
        className={cn(
          'fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-3 rounded-2xl border bg-ink-800 px-4 py-3 text-sm shadow-[0_20px_50px_-30px_rgba(28,28,25,0.7)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm lg:bottom-6',
          tones[tone],
        )}
      >
        <Icon size={18} aria-hidden="true" className="shrink-0" />
        <span className="text-pretty text-paper-100">{message}</span>
      </motion.div>
    </AnimatePresence>
  )
}

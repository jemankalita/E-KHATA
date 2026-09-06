import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const tones = {
  verified: 'bg-teal-400/12 text-teal-500 border-teal-400/30',
  pending: 'bg-amber-500/12 text-amber-800 border-amber-700/30',
  settled: 'bg-sky-600/10 text-sky-900 border-sky-700/25',
  matched: 'bg-teal-400/12 text-teal-500 border-teal-400/30',
  uncertain: 'bg-amber-500/12 text-amber-800 border-amber-700/30',
  unmatched: 'bg-rose-600/10 text-rose-800 border-rose-700/25',
}

export function StatusBadge({
  tone,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone: keyof typeof tones }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

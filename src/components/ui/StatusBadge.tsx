import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const tones = {
  verified: 'bg-white/12 text-cloud border-white/15',
  pending: 'bg-white/8 text-ash border-white/12',
  settled: 'bg-white/8 text-ash border-white/12',
  matched: 'bg-white/12 text-cloud border-white/15',
  uncertain: 'bg-white/8 text-ash border-white/12',
  unmatched: 'bg-orchid-bloom/15 text-orchid-bloom border-orchid-bloom/25',
}

export function StatusBadge({
  tone,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone: keyof typeof tones }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.16em]',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

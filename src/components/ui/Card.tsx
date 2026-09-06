import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-black/[0.06] bg-ink-800 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_18px_50px_-32px_rgba(28,28,25,0.35)]',
        className,
      )}
      {...props}
    />
  )
}

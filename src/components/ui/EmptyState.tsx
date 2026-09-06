import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string
  body?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-dashed border-black/[0.12] bg-black/[0.015] px-5 py-10 text-center sm:px-8',
        className,
      )}
    >
      <p className="font-display text-xl text-paper-100 text-balance">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-paper-400">{body}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

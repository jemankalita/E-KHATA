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
    <div className={cn('rounded-[16px] bg-graphite px-8 py-10 text-center', className)}>
      <p className="font-display text-xl font-normal text-cloud text-balance">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-ash">{body}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

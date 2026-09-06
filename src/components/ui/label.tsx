import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      className={cn('mb-1.5 block text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase', className)}
      {...props}
    />
  )
}

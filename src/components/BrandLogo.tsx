import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/mark.png"
      alt=""
      className={cn('brand-logo inline-block object-contain', className)}
    />
  )
}

export function BrandWordmark({
  showTagline = false,
  className,
}: {
  showTagline?: boolean
  className?: string
}) {
  return (
    <Link to="/login" aria-label="e-Khata" className={cn('inline-flex items-center gap-2.5 text-foreground', className)}>
      <BrandMark className="h-9 w-9 shrink-0" />
      <span className="min-w-0 leading-none" aria-hidden="true">
        <span data-brand-name className="block whitespace-nowrap font-display text-[20px] text-current sm:text-[22px]">
          e-Khata
        </span>
        {showTagline ? (
          <span className="mt-1 hidden text-[11px] text-muted-foreground lg:block">Khata as a credit file.</span>
        ) : null}
      </span>
    </Link>
  )
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="e-Khata — Khata as a credit file."
      className={cn('brand-logo object-contain object-left', className)}
    />
  )
}

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
      <span className="leading-none" aria-hidden="true">
        <span className="block font-display text-[22px] text-current">e-Khata</span>
        {showTagline ? (
          <span className="mt-1 hidden text-[11px] text-muted-foreground lg:block">Trust captured in a snap.</span>
        ) : null}
      </span>
    </Link>
  )
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="e-Khata — Trust captured in a snap."
      className={cn('brand-logo object-contain object-left', className)}
    />
  )
}

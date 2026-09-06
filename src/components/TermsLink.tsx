import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function TermsLink({ className }: { className?: string }) {
  return (
    <Link
      to="/terms"
      className={cn(
        'text-[13px] text-muted-foreground underline decoration-foreground/25 underline-offset-4 hover:text-foreground hover:decoration-foreground/60',
        className,
      )}
    >
      T&amp;C Applied.
    </Link>
  )
}

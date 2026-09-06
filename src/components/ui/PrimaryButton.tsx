import { type ButtonHTMLAttributes } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-pure text-void hover:bg-cloud',
  secondary: 'border border-pure bg-transparent text-pure hover:bg-steel',
  ghost: 'bg-transparent text-ash hover:bg-steel hover:text-cloud',
  danger: 'bg-orchid-bloom text-void hover:brightness-110',
}

export function PrimaryButton({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={props.type ?? 'button'}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-[18px] py-3 text-base font-normal',
        'disabled:pointer-events-none disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
      {variant === 'primary' ? <ArrowRight size={16} aria-hidden="true" /> : null}
    </button>
  )
}

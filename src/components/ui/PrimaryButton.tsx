import { type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary:
    'bg-teal-400 text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_24px_-12px_rgba(11,106,99,0.75)] hover:bg-teal-300 active:bg-teal-500',
  secondary: 'bg-black/[0.04] text-paper-50 border border-black/10 hover:bg-black/[0.07] active:bg-black/[0.1]',
  ghost: 'bg-transparent text-paper-200 hover:bg-black/[0.05] active:bg-black/[0.08]',
  danger: 'bg-clay-400 text-white hover:brightness-110 active:brightness-95',
}

export function PrimaryButton({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={props.type ?? 'button'}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold tracking-tight',
        'transition-[transform,background-color,box-shadow,filter] duration-150 ease-out',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}

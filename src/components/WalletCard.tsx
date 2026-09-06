import { AnimatedNumber } from '@/components/AnimatedNumber'
import { cn } from '@/lib/utils'

export function WalletCard({
  outstanding,
  nextSettlement,
  className,
}: {
  outstanding: number
  nextSettlement: string
  className?: string
}) {
  return (
    <section className={cn('px-1', className)}>
      <p className="text-[13px] text-muted-foreground">Outstanding balance · Next {nextSettlement}</p>
      <AnimatedNumber
        value={outstanding}
        className="mt-2 block font-display text-[52px] leading-none tracking-tight text-foreground md:text-7xl"
      />
      <svg viewBox="0 0 320 72" className="mt-5 h-16 w-full max-w-xl" aria-hidden>
        <path
          className="spark"
          d="M4 48 C 28 48, 36 22, 58 28 S 90 62, 112 40 S 150 8, 176 24 S 214 66, 244 38 S 286 18, 316 30"
        />
      </svg>
    </section>
  )
}

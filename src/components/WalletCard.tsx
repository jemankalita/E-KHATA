import { AnimatedNumber } from '@/components/AnimatedNumber'
import { MoneyGraph } from '@/components/MoneyGraph'
import { cn } from '@/lib/utils'

export function WalletCard({
  outstanding,
  nextSettlement,
  series,
  labels,
  className,
}: {
  outstanding: number
  nextSettlement: string
  series: number[]
  labels?: string[]
  className?: string
}) {
  return (
    <section className={cn('rounded-[28px] bg-card p-6 md:p-7', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Outstanding</p>
          <AnimatedNumber
            value={outstanding}
            className="mt-2 block font-display text-4xl leading-none tracking-tight text-foreground tabular-nums md:text-5xl"
          />
        </div>
        <p className="max-w-[12rem] text-right text-[13px] text-muted-foreground">
          Due {nextSettlement}. This is the running khata, not a month-end estimate.
        </p>
      </div>
      <MoneyGraph
        values={series}
        labels={labels}
        label="Outstanding over recent entries"
        className="mt-6 text-primary"
      />
    </section>
  )
}

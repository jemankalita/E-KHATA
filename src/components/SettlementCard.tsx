import { formatInr } from '@/lib/utils'

export function SettlementCard({
  lines,
  total,
}: {
  lines: { label: string; amount: number }[]
  total: number
}) {
  return (
    <section className="rounded-[28px] bg-card p-5">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        Transaction breakdown
      </p>
      <ul className="mt-4 space-y-3">
        {lines.map((line) => (
          <li key={line.label} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{line.label}</span>
            <span className="font-mono text-foreground">{formatInr(line.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-display text-3xl text-foreground">{formatInr(total)}</span>
      </div>
    </section>
  )
}

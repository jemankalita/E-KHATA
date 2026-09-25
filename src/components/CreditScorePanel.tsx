import { type CreditScoreReport, type ScoreFeature } from '@/lib/creditScore'
import { cn } from '@/lib/utils'

function formatFeatureValue(row: ScoreFeature) {
  if (row.unit === 'share') return `${Math.round(row.value * 100)}%`
  if (row.unit === 'days') return `${row.value}d`
  if (row.unit === 'bills / 30d') return `${row.value}/30d`
  if (row.unit === 'index') return row.value.toFixed(2)
  return String(row.value)
}

function arcPath(score: number) {
  const t = Math.min(1, Math.max(0, (score - 300) / 600))
  const start = Math.PI * 0.85
  const end = Math.PI * 0.15 + t * Math.PI * 1.3
  const r = 42
  const cx = 50
  const cy = 50
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  const large = end - start > Math.PI ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

export function CreditScoreBadge({
  report,
  className,
}: {
  report: CreditScoreReport
  className?: string
}) {
  if (report.status === 'unscored') {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        Thin file · {report.confirmedSettlements}/{report.minConfirmedSettlements} settlements
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <span className="font-display text-xl tabular-nums leading-none text-foreground">{report.score}</span>
      <span className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{report.band}</span>
    </span>
  )
}

export function CreditScorePanel({ report }: { report: CreditScoreReport }) {
  const scored = report.status === 'scored' && report.score !== null

  return (
    <section className="overflow-hidden rounded-[28px] bg-foreground text-background">
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto size-[132px]">
          <svg viewBox="0 0 100 100" className="size-full text-background/25" aria-hidden="true">
            <path
              d="M 12.3 73.3 A 42 42 0 1 1 87.7 73.3"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {scored ? (
              <path
                d={arcPath(report.score!)}
                fill="none"
                className="text-accent"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ) : null}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-4xl tabular-nums leading-none">
                {scored ? report.score : '—'}
              </p>
              <p className="mt-1 text-[10px] tracking-[0.18em] uppercase opacity-70">
                {scored ? report.band : 'unscored'}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl leading-[1.05] text-background">
            {report.subject.customerName}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-background/70">
            Repayment file at {report.subject.merchant}. This is alternative data for thin-file
            underwriting — not a credit line, limit, or interest.
          </p>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-background/55">
            GET /api/credit-score?customer={encodeURIComponent(report.subject.customerName)}
          </p>
        </div>
      </div>
      <ul className="border-t border-background/10 bg-background/6 px-6 py-4">
        {report.features.map((row) => {
          const width = Math.min(100, Math.abs(row.contribution) * 0.9)
          return (
            <li key={row.key} className="border-b border-background/10 py-3 last:border-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm text-background">{row.label}</p>
                <p className="font-mono text-xs tabular-nums text-background/70">{formatFeatureValue(row)}</p>
              </div>
              <div className="mt-2 h-1 rounded-full bg-background/15">
                <span
                  className={cn(
                    'block h-1 rounded-full',
                    row.direction === 'hurts' ? 'bg-destructive' : 'bg-accent',
                  )}
                  style={{ width: `${Math.max(6, width)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-background/60">{row.explanation}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

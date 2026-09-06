import { Check } from 'lucide-react'
import type { TransactionVerification } from '@/types'
import { cn } from '@/lib/utils'

const ROWS: { key: keyof TransactionVerification; label: string }[] = [
  { key: 'qrPayload', label: 'QR payload' },
  { key: 'merchantIdentity', label: 'Merchant identity' },
  { key: 'amount', label: 'Transaction amount' },
  { key: 'transactionId', label: 'Transaction ID' },
  { key: 'customerConfirmation', label: 'Customer confirmation' },
]

export function VerificationPanel({
  verification,
}: {
  verification: TransactionVerification
}) {
  const complete = Object.values(verification).every(Boolean)

  return (
    <section className="rounded-[28px] bg-card p-5">
      <p className={cn('text-[12px] tracking-[0.16em] uppercase', complete ? 'text-primary' : 'text-muted-foreground')}>
        {complete ? 'Transaction verified ✓' : 'Awaiting confirmation'}
      </p>
      <ul className="mt-4 space-y-2.5">
        {ROWS.map((row) => {
          const ok = verification[row.key]
          return (
            <li key={row.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={ok ? 'text-primary' : 'text-muted-foreground'}>
                {ok ? <Check className="size-4" /> : '—'}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        Both parties receive the same transaction record before it enters the final khata balance.
      </p>
    </section>
  )
}

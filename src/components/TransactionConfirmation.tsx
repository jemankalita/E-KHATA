import { formatInr } from '@/lib/utils'
import type { TransactionItem, TransactionVerification } from '@/types'
import { Check } from 'lucide-react'
import { VerificationPanel } from '@/components/VerificationPanel'

export function TransactionConfirmation({
  merchant,
  items,
  amount,
  transactionId,
  verification,
}: {
  merchant: string
  items: TransactionItem[]
  amount: number
  transactionId: string
  verification?: TransactionVerification
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] bg-card p-5">
        <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Merchant</p>
        <p className="mt-1 text-xl text-foreground">{merchant}</p>
        <ul className="mt-5 space-y-2.5 border-t border-border pt-4 font-mono text-sm">
          {items.map((item) => (
            <li key={`${item.name}-${item.price}`} className="flex items-baseline justify-between gap-3 text-muted-foreground">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="text-foreground">{formatInr(item.quantity * item.price)}</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between border-t border-dashed border-border pt-3 text-foreground">
            <span>Total</span>
            <span className="text-lg">{formatInr(amount)}</span>
          </li>
        </ul>
      </div>

      <div className="space-y-2 rounded-[24px] bg-background px-4 py-3.5 text-sm">
        <p className="flex items-center gap-2 text-accent">
          <Check className="size-4" /> Merchant verified
        </p>
        <p className="flex items-center gap-2 text-accent">
          <Check className="size-4" /> Transaction ID generated
        </p>
        <p className="flex items-center gap-2 text-accent">
          <Check className="size-4" /> Price data verified
        </p>
      </div>

      <p className="text-center text-[13px] text-muted-foreground">
        Transaction ID <span className="font-mono text-foreground">{transactionId}</span>
      </p>

      <VerificationPanel
        verification={
          verification ?? {
            qrPayload: true,
            merchantIdentity: true,
            amount: true,
            transactionId: true,
            customerConfirmation: false,
          }
        }
      />
    </div>
  )
}

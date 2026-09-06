import { formatInr } from '@/lib/utils'
import type { Transaction } from '@/types'
import { ChevronRight } from 'lucide-react'

export function TransactionCard({
  transaction,
  onClick,
}: {
  transaction: Transaction
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[24px] bg-card px-3.5 py-3.5 text-left"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-sm text-foreground">
        {transaction.merchant.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-foreground">{transaction.merchant}</span>
        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.round((transaction.amount / 600) * 100))}%` }}
          />
        </span>
        <span className="mt-1 block text-[12px] text-muted-foreground">
          {transaction.category} · {transaction.source}
        </span>
      </span>
      <span className="text-right">
        <span className="block text-[15px] text-foreground">{formatInr(transaction.amount)}</span>
        <span className="text-[11px] text-accent">
          {transaction.status === 'verified' ? 'Verified' : 'Pending'}
        </span>
      </span>
      {onClick ? <ChevronRight className="size-4 text-muted-foreground" /> : null}
    </button>
  )
}

import { formatPayBy } from '@/lib/payBy'
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
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-foreground">{transaction.merchant}</span>
        <span className="mt-1 block text-[12px] text-muted-foreground">
          {transaction.payBy ? formatPayBy(transaction.payBy) : transaction.category}
        </span>
      </span>
      <span className="text-right">
        <span className="block text-[15px] text-foreground">{formatInr(transaction.amount)}</span>
      </span>
      {onClick ? <ChevronRight className="size-4 text-muted-foreground" /> : null}
    </button>
  )
}

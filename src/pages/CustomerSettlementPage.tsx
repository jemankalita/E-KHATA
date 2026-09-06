import { SettlementCard } from '@/components/SettlementCard'
import { useKhata } from '@/hooks/useKhata'
import { formatInr } from '@/lib/utils'
import { useMemo } from 'react'

export function CustomerSettlementPage() {
  const { state } = useKhata()

  const lines = useMemo(() => {
    const open = state.transactions.filter((tx) => !tx.settled)
    const rows = open.map((tx) => ({ label: tx.merchant, amount: tx.amount }))
    if (rows.length === 0) rows.push({ label: 'Existing balance', amount: state.wallet.outstanding })
    return rows
  }, [state.transactions, state.wallet.outstanding])

  return (
    <div className="grid items-start gap-12 lg:grid-cols-2">
      <div>
        <p className="text-[13px] text-accent">Automatic settlement</p>
        <h1 className="mt-2 font-display text-[64px] leading-none text-foreground">
          {formatInr(state.wallet.outstanding)}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Open entries clear on{' '}
          <span className="text-foreground">{state.settlement.dateLabel}</span>. There is no customer QR path and no
          manual settle button.
        </p>
      </div>
      <SettlementCard lines={lines} total={state.wallet.outstanding} />
    </div>
  )
}

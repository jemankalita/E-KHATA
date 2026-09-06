import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { formatInr } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export function CustomerSettlementPage() {
  const { state, settleStore } = useKhata()
  const [busyStore, setBusyStore] = useState<string | null>(null)

  const stores = useMemo(() => {
    const open = state.transactions.filter((tx) => !tx.settled)
    const map = new Map<string, { merchant: string; amount: number; entries: number }>()
    for (const tx of open) {
      const current = map.get(tx.merchant) ?? { merchant: tx.merchant, amount: 0, entries: 0 }
      map.set(tx.merchant, {
        merchant: tx.merchant,
        amount: current.amount + tx.amount,
        entries: current.entries + 1,
      })
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount)
  }, [state.transactions])

  return (
    <div className="grid items-start gap-12 lg:grid-cols-2">
      <div>
        <p className="text-[13px] text-accent">Settle by store</p>
        <h1 className="mt-2 font-display text-[64px] leading-none text-foreground">
          {formatInr(state.wallet.outstanding)}
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Clear each shop on its own. Open dues still auto-clear on{' '}
          <span className="text-foreground">{state.settlement.dateLabel}</span> if you leave them.
        </p>
      </div>

      <section className="space-y-3">
        {stores.length === 0 ? (
          <p className="rounded-[28px] bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Every store is clear. Nothing left to settle.
          </p>
        ) : (
          stores.map((store) => (
            <article key={store.merchant} className="rounded-[28px] bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                    {store.entries} {store.entries === 1 ? 'entry' : 'entries'}
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-foreground">{store.merchant}</h2>
                </div>
                <p className="font-display text-2xl text-primary">{formatInr(store.amount)}</p>
              </div>
              <Button
                className="mt-5 w-full"
                disabled={busyStore === store.merchant}
                onClick={() => {
                  setBusyStore(store.merchant)
                  settleStore(store.merchant)
                  toast.success(`Settled ${store.merchant}`, {
                    description: `${formatInr(store.amount)} cleared from your khata.`,
                  })
                  window.setTimeout(() => setBusyStore(null), 400)
                }}
              >
                Settle {store.merchant}
              </Button>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

import { TransactionCard } from '@/components/TransactionCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAutomaticRfid } from '@/hooks/useAutomaticRfid'
import { useKhata } from '@/hooks/useKhata'
import { soonestPayBy } from '@/lib/customerBalances'
import { formatPayBy, isOverdue } from '@/lib/payBy'
import type { RfidTap } from '@/lib/rfid'
import { formatInr } from '@/lib/utils'
import { motion } from 'framer-motion'
import { QrCode, Radio } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function CustomerDashboardPage() {
  const { state, addRfidFare } = useKhata()
  const navigate = useNavigate()
  const [recognized, setRecognized] = useState<RfidTap | null>(null)
  const listenerRef = useRef<HTMLDivElement>(null)

  const mine = useMemo(
    () => state.transactions.filter((tx) => tx.customerName === state.customer.name && !tx.settled),
    [state.customer.name, state.transactions],
  )
  const due = soonestPayBy(mine)
  const overdue = due ? isOverdue(due) : false

  const stores = useMemo(() => {
    const map = new Map<string, { merchant: string; amount: number }>()
    for (const tx of mine) {
      map.set(tx.merchant, {
        merchant: tx.merchant,
        amount: (map.get(tx.merchant)?.amount ?? 0) + tx.amount,
      })
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount)
  }, [mine])

  const onCard = useCallback(
    (tap: RfidTap) => {
      addRfidFare(tap)
      setRecognized(tap)
      toast.success('RFID recognized', {
        description: `${tap.merchant} · ${formatInr(tap.amount)} added to your E-Khata.`,
      })
    },
    [addRfidFare],
  )

  useAutomaticRfid(onCard)

  return (
    <div className="mx-auto max-w-2xl">
      <div
        ref={listenerRef}
        tabIndex={-1}
        data-testid="rfid-listener"
        className="sr-only"
      >
        Listening for RFID
      </div>

      <p className="text-[13px] text-accent">{state.customer.name}</p>
      <h1 className="mt-1 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">To pay</h1>

      <section className="mt-8 rounded-[28px] bg-card p-6">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Open balance</p>
        <p className="mt-2 font-display text-4xl tabular-nums text-foreground md:text-5xl">
          {formatInr(state.wallet.outstanding)}
        </p>
        <p className={`mt-2 text-sm ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
          {due ? formatPayBy(due) : `Due ${state.wallet.nextSettlement}`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate('/customer/settlement')} disabled={mine.length === 0}>
            Settle
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/customer/scan')}>
            <QrCode /> Scan
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">By shop</h2>
        {stores.length === 0 ? (
          <p className="rounded-[24px] bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing to pay. Your khata is clear.
          </p>
        ) : (
          <ul className="space-y-2">
            {stores.map((store) => (
              <li
                key={store.merchant}
                className="flex items-center justify-between rounded-[24px] bg-card px-4 py-4"
              >
                <p className="text-foreground">{store.merchant}</p>
                <p className="font-display text-xl tabular-nums">{formatInr(store.amount)}</p>
              </li>
            ))}
            {state.wallet.carriedForward > 0 ? (
              <li className="flex items-center justify-between rounded-[24px] bg-card px-4 py-4">
                <p className="text-muted-foreground">Earlier balance</p>
                <p className="font-display text-xl tabular-nums">{formatInr(state.wallet.carriedForward)}</p>
              </li>
            ) : null}
          </ul>
        )}
      </section>

      {mine.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Open bills</h2>
            <button type="button" className="text-[13px] text-primary" onClick={() => navigate('/customer/ledger')}>
              All
            </button>
          </div>
          <div className="grid gap-3">
            {mine.slice(0, 5).map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onClick={() => navigate('/customer/ledger', { state: { openId: tx.id } })}
              />
            ))}
          </div>
        </section>
      ) : null}

      <Dialog open={recognized !== null} onOpenChange={(open) => !open && setRecognized(null)}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            listenerRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
              <Radio className="size-5" /> RFID recognized
            </DialogTitle>
            <DialogDescription>Fare posted to your khata.</DialogDescription>
          </DialogHeader>
          {recognized ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3 rounded-[20px] bg-background p-4"
            >
              <p className="font-display text-3xl text-foreground">{recognized.merchant}</p>
              <p className="text-sm text-muted-foreground">{formatInr(recognized.amount)}</p>
            </motion.div>
          ) : null}
          <Button className="mt-5 w-full" onClick={() => setRecognized(null)}>
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useKhata } from '@/hooks/useKhata'
import { remainingOnBill } from '@/lib/creditScore/fromKhataState'
import { formatPayBy } from '@/lib/payBy'
import { openSettlementCheckout, type SettlementPaymentOutcome } from '@/lib/razorpayCheckout'
import { buildSettlementPayment, type SettlementPaymentRequest } from '@/lib/settlementPayment'
import { formatInr } from '@/lib/utils'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

export function CustomerSettlementPage() {
  const { state, settleStore, payStore } = useKhata()
  const [busyStore, setBusyStore] = useState<string | null>(null)
  const [demoPay, setDemoPay] = useState<SettlementPaymentRequest | null>(null)
  const demoResolve = useRef<((outcome: SettlementPaymentOutcome) => void) | null>(null)

  const stores = useMemo(() => {
    const open = state.transactions.filter(
      (tx) => remainingOnBill(tx) > 0 && tx.customerName === state.customer.name,
    )
    const map = new Map<string, { merchant: string; amount: number; entries: number; payBy: string }>()
    for (const tx of open) {
      const current = map.get(tx.merchant) ?? { merchant: tx.merchant, amount: 0, entries: 0, payBy: tx.payBy }
      const payBy =
        tx.payBy && (!current.payBy || Date.parse(tx.payBy) < Date.parse(current.payBy)) ? tx.payBy : current.payBy
      map.set(tx.merchant, {
        merchant: tx.merchant,
        amount: current.amount + remainingOnBill(tx),
        entries: current.entries + 1,
        payBy,
      })
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount)
  }, [state.customer.name, state.transactions])

  const closeDemoPay = (outcome: SettlementPaymentOutcome) => {
    const resolve = demoResolve.current
    if (!resolve) return
    demoResolve.current = null
    setDemoPay(null)
    resolve(outcome)
  }

  const payAndSettle = async (store: { merchant: string; amount: number }, paying: number) => {
    if (busyStore !== null) return
    const amountInr = Math.min(store.amount, Math.max(1, Math.round(paying)))
    setBusyStore(store.merchant)
    try {
      const request = buildSettlementPayment({
        merchant: store.merchant,
        customerName: state.customer.name,
        amountInr,
      })
      const outcome = await openSettlementCheckout(request, {
        openDemoCheckout: (pending) =>
          new Promise((resolve) => {
            demoResolve.current = resolve
            setDemoPay(pending)
          }),
      })

      if (outcome.status === 'paid') {
        if (amountInr >= store.amount) settleStore(store.merchant)
        else payStore(store.merchant, amountInr)
        toast.success(`Paid ${store.merchant}`, {
          description: `${formatInr(amountInr)} captured · ${outcome.paymentId}. The shop is notified.`,
        })
        return
      }

      if (outcome.status === 'cancelled') {
        toast.info('Payment cancelled', {
          description: `${store.merchant} is still open on your khata.`,
        })
        return
      }

      toast.error('Payment failed', {
        description: outcome.message,
      })
    } catch (error) {
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Could not start checkout.',
      })
    } finally {
      setBusyStore(null)
    }
  }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-2">
      <div>
        <p className="text-[13px] text-accent">Settle by store</p>
        <h1 className="mt-2 font-display text-[64px] leading-none text-foreground">
          {formatInr(state.wallet.outstanding)}
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Pay each shop before the khata clears. Confirmed payments write your score; auto-clear on{' '}
          <span className="text-foreground">{state.settlement.dateLabel}</span> does not.
        </p>
      </div>

      <section className="space-y-3">
        {stores.length === 0 ? (
          <p className="rounded-[28px] bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Every store is clear. Nothing left to settle.
          </p>
        ) : (
          stores.map((store) => (
            <StorePayCard
              key={store.merchant}
              store={store}
              busy={busyStore !== null}
              onPay={(amount) => {
                void payAndSettle(store, amount)
              }}
            />
          ))
        )}
      </section>

      <Dialog
        open={demoPay !== null}
        onOpenChange={(open) => {
          if (!open) closeDemoPay({ status: 'cancelled' })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Razorpay checkout</DialogTitle>
            <DialogDescription>
              Add <code className="text-foreground">VITE_RAZORPAY_KEY_ID</code> for live Razorpay. This demo
              captures the same amount without a Key Secret.
            </DialogDescription>
          </DialogHeader>
          {demoPay ? (
            <div className="mt-4 space-y-4">
              <p className="font-display text-3xl text-foreground">{formatInr(demoPay.amountInr)}</p>
              <p className="text-sm text-muted-foreground">
                Paying {demoPay.merchant} as {demoPay.customerName}.
              </p>
              <div className="grid gap-2">
                <Button
                  onClick={() =>
                    closeDemoPay({
                      status: 'paid',
                      provider: 'razorpay',
                      paymentId: `pay_demo_${demoPay.amountPaise}`,
                    })
                  }
                >
                  Complete test payment
                </Button>
                <Button variant="ghost" onClick={() => closeDemoPay({ status: 'cancelled' })}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StorePayCard({
  store,
  busy,
  onPay,
}: {
  store: { merchant: string; amount: number; entries: number; payBy: string }
  busy: boolean
  onPay: (amount: number) => void
}) {
  const [amount, setAmount] = useState(String(store.amount))
  return (
    <article className="rounded-[28px] bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {store.entries} {store.entries === 1 ? 'entry' : 'entries'}
          </p>
          <h2 className="mt-1 font-display text-2xl text-foreground">{store.merchant}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{formatPayBy(store.payBy)}</p>
        </div>
        <p className="font-display text-2xl text-primary">{formatInr(store.amount)}</p>
      </div>
      <label className="mt-4 block text-xs text-muted-foreground">
        Amount to pay (partial allowed)
        <Input
          className="mt-2"
          inputMode="numeric"
          aria-label={`Amount to pay ${store.merchant}`}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <Button
        className="mt-5 w-full"
        disabled={busy}
        onClick={() => onPay(Number(amount))}
      >
        Pay & settle {store.merchant}
      </Button>
    </article>
  )
}

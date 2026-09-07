import { TransactionCard } from '@/components/TransactionCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WalletCard } from '@/components/WalletCard'
import { useAutomaticRfid } from '@/hooks/useAutomaticRfid'
import { useKhata } from '@/hooks/useKhata'
import type { RfidTap } from '@/lib/rfid'
import { formatInr } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Nfc, QrCode, Radio } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function CustomerDashboardPage() {
  const { state, addRfidFare } = useKhata()
  const navigate = useNavigate()
  const [recognized, setRecognized] = useState<RfidTap | null>(null)
  const listenerRef = useRef<HTMLDivElement>(null)

  const recent = state.transactions.filter((tx) => !tx.settled).slice(0, 6)
  const openTxs = state.transactions.filter((tx) => !tx.settled)
  const qrTotal = openTxs.filter((tx) => tx.source === 'QR').reduce((s, tx) => s + tx.amount, 0)
  const rfidTotal = openTxs.filter((tx) => tx.source === 'RFID').reduce((s, tx) => s + tx.amount, 0)

  const monthly = useMemo(() => {
    const map = new Map<string, number>()
    for (const tx of openTxs) {
      map.set(tx.merchant, (map.get(tx.merchant) ?? 0) + tx.amount)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [openTxs])

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
    <div>
      <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <WalletCard outstanding={state.wallet.outstanding} nextSettlement={state.wallet.nextSettlement} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniCard label="QR khata" value={formatInr(qrTotal)} delta="Verified" />
          <MiniCard label="RFID" value={formatInr(rfidTotal)} delta="Auto listen" />
          <div
            ref={listenerRef}
            tabIndex={-1}
            data-testid="rfid-listener"
            className="flex items-center justify-between rounded-[24px] bg-accent px-5 py-4 text-left text-accent-foreground outline-none sm:col-span-2"
          >
            <span>
              <span className="block text-[11px] opacity-70">Automatic RFID recognition</span>
              <span className="text-[16px] font-medium">Listening for RFID</span>
              <span className="mt-1 block text-[12px] opacity-80">
                Hold a card to the reader, or use a USB RFID wedge. Known demo UID: EKRFID21G
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-3 py-1.5 text-[12px] font-medium">
              <Nfc className="size-3.5" /> Live
            </span>
          </div>
          <Button className="sm:col-span-2" onClick={() => navigate('/customer/scan')}>
            <QrCode /> Scan a shop QR
          </Button>
          <Button variant="secondary" className="sm:col-span-2" onClick={() => navigate('/customer/ledger')}>
            Open my khata
          </Button>
        </div>
      </div>

      <section className="mt-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl text-foreground">You have {openTxs.length} open entries</h2>
          <button type="button" className="text-[13px] text-primary" onClick={() => navigate('/customer/ledger')}>
            See all
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-[24px] bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No open entries. Your khata is clear.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recent.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onClick={() => navigate('/customer/ledger', { state: { openId: tx.id } })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-[28px] bg-card p-6">
        <p className="text-[13px] text-accent">2 · This cycle</p>
        <h3 className="mt-1 font-display text-2xl text-foreground">Spending mix</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {monthly.map(([merchant, amount]) => {
            const pct = state.wallet.outstanding ? Math.round((amount / state.wallet.outstanding) * 100) : 0
            return (
              <div key={merchant}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="text-muted-foreground">{merchant}</span>
                  <span>{formatInr(amount)}</span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-foreground/10"
                  role="progressbar"
                  aria-label={`${merchant} share of outstanding`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

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
            <DialogDescription>Card matched automatically. Fare posted to your khata.</DialogDescription>
          </DialogHeader>
          {recognized ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3 rounded-[20px] bg-background p-4"
            >
              <p className="font-display text-3xl text-foreground">{recognized.merchant}</p>
              <Row label="Fare" value={formatInr(recognized.amount)} />
              <Row label="Card" value={recognized.uid} />
              <Row label="Source" value="RFID" />
              <Row label="Status" value="Verified" />
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

function MiniCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-[24px] bg-card p-5">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
      <span className="mt-2 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent">{delta}</span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

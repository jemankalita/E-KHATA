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
import { RFID_FARE } from '@/data/demo'
import { useKhata } from '@/hooks/useKhata'
import { formatInr } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowRight, Nfc, Radio } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function CustomerDashboardPage() {
  const { state, addRfidFare } = useKhata()
  const navigate = useNavigate()
  const [rfidOpen, setRfidOpen] = useState(false)
  const [adding, setAdding] = useState(false)

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

  return (
    <div>
      <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <WalletCard outstanding={state.wallet.outstanding} nextSettlement={state.wallet.nextSettlement} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniCard label="QR khata" value={formatInr(qrTotal)} delta="Verified" />
          <MiniCard label="RFID" value={formatInr(rfidTotal)} delta="Prototype" />
          <button
            type="button"
            data-testid="simulate-rfid"
            onClick={() => setRfidOpen(true)}
            className="flex items-center justify-between rounded-[24px] bg-accent px-5 py-4 text-left text-accent-foreground sm:col-span-2"
          >
            <span>
              <span className="block text-[11px] opacity-70">RFID integration · Prototype</span>
              <span className="text-[16px] font-medium">Simulate a bus tap</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-3 py-1.5 text-[12px] font-medium">
              Find out <ArrowRight className="size-3.5" />
            </span>
          </button>
          <Button className="sm:col-span-2" onClick={() => navigate('/customer/ledger')}>
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
                <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Dialog open={rfidOpen} onOpenChange={setRfidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
              <Radio className="size-5" /> RFID detected
            </DialogTitle>
            <DialogDescription>RFID Integration · Prototype</DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3 rounded-[20px] bg-background p-4"
          >
            <p className="font-display text-3xl text-foreground">Bus Route 21G</p>
            <Row label="Fare" value={formatInr(RFID_FARE)} />
            <Row label="Source" value="RFID" />
            <Row label="Status" value="Verified" />
          </motion.div>
          <Button
            className="mt-5 w-full"
            data-testid="add-rfid"
            disabled={adding}
            onClick={() => {
              setAdding(true)
              addRfidFare()
              toast.success('Transaction added', {
                description: `${formatInr(RFID_FARE)} added to your E-Khata.`,
              })
              setTimeout(() => {
                setAdding(false)
                setRfidOpen(false)
              }, 500)
            }}
          >
            <Nfc /> Add to E-Khata
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

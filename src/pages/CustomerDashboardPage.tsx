import { WalletCard } from '@/components/WalletCard'
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
import { ledgerSpark } from '@/lib/moneyGraph'
import { isOverdue } from '@/lib/payBy'
import type { RfidTap } from '@/lib/rfid'
import { formatInr } from '@/lib/utils'
import { motion } from 'framer-motion'
import { BookOpen, Package, QrCode, Radio } from 'lucide-react'
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
  const qrTotal = mine.filter((tx) => tx.source === 'QR').reduce((sum, tx) => sum + tx.amount, 0)
  const rfidTotal = mine.filter((tx) => tx.source === 'RFID').reduce((sum, tx) => sum + tx.amount, 0)
  const chart = ledgerSpark(state.wallet.carriedForward, mine)

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
    <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_0.9fr]">
      <WalletCard
        outstanding={state.wallet.outstanding}
        nextSettlement={state.wallet.nextSettlement}
        series={chart.values}
        labels={chart.labels}
        dueNote={`${overdue ? 'Overdue. ' : ''}Due ${state.wallet.nextSettlement}. This is the running khata, not a month-end estimate.`}
      />

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <SummaryTile label="QR khata" amount={qrTotal} tag="Verified" />
          <SummaryTile label="RFID" amount={rfidTotal} tag="Auto listen" />
        </div>

        <div
          ref={listenerRef}
          tabIndex={-1}
          data-testid="rfid-listener"
          className="rounded-[24px] bg-accent/18 px-5 py-5 outline-none"
        >
          <p className="text-[11px] tracking-[0.16em] text-accent uppercase">Automatic RFID recognition</p>
          <p className="mt-2 font-display text-3xl text-foreground">Listening for RFID</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Hold a card or scan a barcode. Bus {formatInr(20)}, metro {formatInr(50)}, canteen{' '}
            {formatInr(100)}. Demo UIDs: EKRFID21G, EKRFIDMETRO, EKRFIDCANTEEN.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-background/40 px-3 py-1 text-xs text-accent">
            <Radio className="size-3.5" /> Live
          </p>
        </div>

        <Button size="lg" className="h-14 w-full justify-start gap-3" onClick={() => navigate('/customer/scan')}>
          <Package className="size-5" /> Scan a pack
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-14 w-full justify-start gap-3"
          onClick={() => navigate('/customer/scan?mode=qr')}
        >
          <QrCode className="size-5" /> Scan a QR bill
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-14 w-full justify-start gap-3"
          onClick={() => navigate('/customer/ledger')}
        >
          <BookOpen className="size-5" /> Open my khata
        </Button>
      </div>

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

function SummaryTile({ label, amount, tag }: { label: string; amount: number; tag: string }) {
  return (
    <div className="rounded-[24px] bg-card px-4 py-4">
      <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums text-foreground">{formatInr(amount)}</p>
      <p className="mt-2 text-xs text-accent">{tag}</p>
    </div>
  )
}

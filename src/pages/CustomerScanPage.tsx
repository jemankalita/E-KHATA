import { QRScanner } from '@/components/QRScanner'
import { TransactionConfirmation } from '@/components/TransactionConfirmation'
import { Button } from '@/components/ui/button'
import { buildDefaultPendingQr } from '@/data/demo'
import { useKhata } from '@/hooks/useKhata'
import { encodeQrPayload, formatInr } from '@/lib/utils'
import type { PendingQr } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type Stage = 'scan' | 'found' | 'added'

export function CustomerScanPage() {
  const { state, prepareScanPayload, confirmPendingQr } = useKhata()
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('scan')
  const [scanning, setScanning] = useState(false)
  const [draft, setDraft] = useState<PendingQr>(state.pendingQr ?? buildDefaultPendingQr())
  const [fromBalance, setFromBalance] = useState(state.wallet.outstanding)
  const [toBalance, setToBalance] = useState(state.wallet.outstanding)
  const [delta, setDelta] = useState(0)
  const [animStep, setAnimStep] = useState<0 | 1 | 2>(0)

  const qrValue = useMemo(
    () => encodeQrPayload({ id: draft.id, merchant: draft.merchant, amount: draft.amount }),
    [draft],
  )

  function simulateScan() {
    setScanning(true)
    const payload = prepareScanPayload()
    setDraft(payload)
    window.setTimeout(() => {
      setScanning(false)
      setStage('found')
    }, 700)
  }

  function confirm() {
    const before = state.wallet.outstanding
    confirmPendingQr(draft)
    setFromBalance(before)
    setToBalance(before + draft.amount)
    setDelta(draft.amount)
    setStage('added')
    setAnimStep(0)
    window.setTimeout(() => setAnimStep(1), 700)
    window.setTimeout(() => setAnimStep(2), 1500)
    toast.success('Transaction added', { description: 'Your E-Khata has been updated.' })
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {stage === 'scan' ? (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid items-center gap-12 lg:grid-cols-2"
          >
            <div>
              <p className="text-[13px] text-accent">Scan E-Khata QR</p>
              <h1 className="mt-2 font-display text-5xl leading-[1.05] text-foreground">Merchant credit</h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Scan a merchant transaction to add it to your digital khata. Sharma Stores, three items, ₹386
                for the demo path.
              </p>
              <Button
                size="lg"
                className="mt-8"
                data-testid="simulate-qr-scan"
                onClick={simulateScan}
                disabled={scanning}
              >
                {scanning ? 'Reading QR…' : 'Simulate QR Scan'}
              </Button>
            </div>
            <QRScanner active={scanning || stage === 'scan'} payload={qrValue} />
          </motion.div>
        ) : null}

        {stage === 'found' ? (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto max-w-xl"
          >
            <p className="text-[12px] tracking-[0.2em] text-primary uppercase">Transaction found ✓</p>
            <h1 className="mt-2 mb-6 font-display text-4xl text-foreground">Review entry</h1>
            <TransactionConfirmation
              merchant={draft.merchant}
              items={draft.items}
              amount={draft.amount}
              transactionId={draft.id}
            />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setStage('scan')}>
                Cancel
              </Button>
              <Button data-testid="confirm-add" onClick={confirm}>
                Confirm & Add
              </Button>
            </div>
          </motion.div>
        ) : null}

        {stage === 'added' ? (
          <motion.div
            key="added"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-10 text-center"
          >
            <div className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
              <Check className="size-7" />
            </div>
            <p className="text-[11px] tracking-[0.2em] text-primary uppercase">Transaction added</p>
            <p className="mt-2 text-muted-foreground">Your E-Khata has been updated.</p>
            <div className="mt-10 space-y-4 font-display text-6xl text-foreground">
              {animStep === 0 ? <motion.p layout>{formatInr(fromBalance)}</motion.p> : null}
              {animStep === 1 ? (
                <motion.p layout className="text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  ↓ {formatInr(delta)}
                </motion.p>
              ) : null}
              {animStep === 2 ? (
                <motion.p layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {formatInr(toBalance)}
                </motion.p>
              ) : null}
            </div>
            <div className="mx-auto mt-12 grid max-w-md gap-3 sm:grid-cols-2">
              <Button onClick={() => navigate('/customer/ledger')}>Open ledger</Button>
              <Button variant="secondary" onClick={() => navigate('/customer')}>
                Dashboard
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

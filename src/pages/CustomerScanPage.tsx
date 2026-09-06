import { CameraQrReader } from '@/components/CameraQrReader'
import { TransactionConfirmation } from '@/components/TransactionConfirmation'
import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { parseKhataQrValue } from '@/lib/khataQr'
import { publishLiveQr } from '@/lib/liveQr'
import { formatInr } from '@/lib/utils'
import type { PendingQr } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type Stage = 'scan' | 'found' | 'added'

export function CustomerScanPage() {
  const { state, applyScannedQr, markCustomerScanned } = useKhata()
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('scan')
  const [draft, setDraft] = useState<PendingQr | null>(null)
  const [fromBalance, setFromBalance] = useState(state.wallet.outstanding)
  const [toBalance, setToBalance] = useState(state.wallet.outstanding)
  const [delta, setDelta] = useState(0)
  const [animStep, setAnimStep] = useState<0 | 1 | 2>(0)

  const onRead = useCallback(
    (value: string) => {
      const parsed = parseKhataQrValue(value)
      if (!parsed) {
        toast.error('That QR is not an e-Khata bill.')
        return
      }
      markCustomerScanned()
      void publishLiveQr({ ...parsed, status: 'scanned' })
      setDraft(parsed)
      setStage('found')
    },
    [markCustomerScanned],
  )

  function confirm() {
    if (!draft) return
    const before = state.wallet.outstanding
    applyScannedQr(draft)
    setFromBalance(before)
    setToBalance(before + draft.amount)
    setDelta(draft.amount)
    setStage('added')
    setAnimStep(0)
    window.setTimeout(() => setAnimStep(1), 700)
    window.setTimeout(() => setAnimStep(2), 1500)
    toast.success('Posted to the shop account')
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
              <p className="text-[13px] text-accent">Scan with the camera</p>
              <h1 className="mt-2 font-display text-5xl leading-[1.05] text-foreground">Merchant credit</h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Point this camera at the shop QR, or open the shop QR with your phone Camera app. Confirming
                writes the bill to the shopkeeper account and your khata.
              </p>
            </div>
            <CameraQrReader onRead={onRead} />
          </motion.div>
        ) : null}

        {stage === 'found' && draft ? (
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
            <p className="text-[11px] tracking-[0.2em] text-primary uppercase">Posted to the shop</p>
            <p className="mt-2 text-muted-foreground">Your khata and the shopkeeper account are updated.</p>
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

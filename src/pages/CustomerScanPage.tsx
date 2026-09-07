import { CameraPackReader } from '@/components/CameraPackReader'
import { CameraQrReader } from '@/components/CameraQrReader'
import { Button } from '@/components/ui/button'
import { PRODUCT_CATALOG } from '@/data/catalog'
import { useAutomaticRfid } from '@/hooks/useAutomaticRfid'
import { useKhata } from '@/hooks/useKhata'
import { publishLiveQr } from '@/lib/liveQr'
import { parseKhataQrValue } from '@/lib/khataQr'
import { recognizeRfid, type RfidTap } from '@/lib/rfid'
import { resolveScannedCharge } from '@/lib/resolveScannedCharge'
import { formatInr, formatSequenceId } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

type Stage = 'scan' | 'added'
type ScanMode = 'pack' | 'qr'

export function CustomerScanPage() {
  const { state, applyScannedQr, addRfidFare, markCustomerScanned } = useKhata()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<ScanMode>(params.get('mode') === 'qr' ? 'qr' : 'pack')
  const [stage, setStage] = useState<Stage>('scan')
  const [fromBalance, setFromBalance] = useState(state.wallet.outstanding)
  const [toBalance, setToBalance] = useState(state.wallet.outstanding)
  const [delta, setDelta] = useState(0)
  const [itemName, setItemName] = useState('')
  const [animStep, setAnimStep] = useState<0 | 1 | 2>(0)

  const showPosted = useCallback(
    (name: string, amount: number) => {
      const before = state.wallet.outstanding
      setItemName(name)
      setFromBalance(before)
      setToBalance(before + amount)
      setDelta(amount)
      setStage('added')
      setAnimStep(0)
      window.setTimeout(() => setAnimStep(1), 700)
      window.setTimeout(() => setAnimStep(2), 1500)
      toast.success(`${name} · ${formatInr(amount)} added to your wallet`)
    },
    [state.wallet.outstanding],
  )

  const postRfid = useCallback(
    (tap: RfidTap) => {
      addRfidFare(tap)
      showPosted(tap.merchant, tap.amount)
    },
    [addRfidFare, showPosted],
  )

  useAutomaticRfid(postRfid)

  const onRead = useCallback(
    (value: string) => {
      const tap = recognizeRfid(value)
      if (tap) {
        postRfid(tap)
        return
      }
      const charge = resolveScannedCharge(value, {
        nextId: formatSequenceId(state.nextSequence),
        merchant: state.merchant.name,
        customerName: state.customer.name,
      })
      if (!charge) {
        toast.error(mode === 'qr' ? 'That QR is not an e-Khata bill.' : 'That pack is not in the shop catalog.')
        return
      }
      if (parseKhataQrValue(value)) {
        markCustomerScanned()
        void publishLiveQr({ ...charge, status: 'scanned' })
      }
      applyScannedQr(charge)
      showPosted(charge.items[0]?.name ?? charge.merchant, charge.amount)
    },
    [applyScannedQr, markCustomerScanned, mode, postRfid, showPosted, state],
  )

  return (
    <div>
      <AnimatePresence mode="wait">
        {stage === 'scan' ? (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid items-start gap-12 lg:grid-cols-2"
          >
            <div>
              <p className="text-[13px] text-accent">Scan a pack, QR bill, or RFID</p>
              <h1 className="mt-2 font-display text-5xl leading-[1.05] text-foreground">Add to wallet</h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Use Pack for Maggi, Amul milk, Lays, and the rest of the catalog. Use QR bill for a shop QR. RFID
                still posts bus ₹20, metro ₹50, and canteen ₹100.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button variant={mode === 'pack' ? 'default' : 'secondary'} onClick={() => setMode('pack')}>
                  Pack
                </Button>
                <Button variant={mode === 'qr' ? 'default' : 'secondary'} onClick={() => setMode('qr')}>
                  QR bill
                </Button>
              </div>
              <section className="mt-8">
                <h2 className="font-display text-2xl text-foreground">Shop catalog</h2>
                <ul className="mt-4 divide-y divide-border rounded-[24px] bg-card">
                  {PRODUCT_CATALOG.map((product) => (
                    <li key={product.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-foreground">{product.name}</span>
                      <span className="text-muted-foreground">{formatInr(product.unitPrice)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            {mode === 'pack' ? <CameraPackReader onRead={onRead} /> : <CameraQrReader onRead={onRead} />}
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
            <p className="text-[11px] tracking-[0.2em] text-primary uppercase">Added to wallet</p>
            <p className="mt-2 text-muted-foreground">
              {itemName} is on your khata at {formatInr(delta)}.
            </p>
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

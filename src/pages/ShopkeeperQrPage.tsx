import { QRGenerator } from '@/components/QRGenerator'
import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { fetchLiveQr } from '@/lib/liveQr'
import { playConfirmation } from '@/lib/voice'
import { motion } from 'framer-motion'
import { Check, Loader } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function ShopkeeperQrPage() {
  const { state, confirmFromMerchant, applyScannedQr, markCustomerScanned } = useKhata()
  const navigate = useNavigate()
  const pending = state.pendingQr
  const posted = useRef(false)

  useEffect(() => {
    if (!pending || pending.status === 'confirmed') return
    const tick = window.setInterval(() => {
      void fetchLiveQr(pending.id).then((live) => {
        if (live?.status === 'scanned' && pending.status === 'waiting') {
          markCustomerScanned()
        }
        if (live?.status === 'confirmed' && !posted.current) {
          posted.current = true
          applyScannedQr(live)
          toast.success('Customer scanned', { description: 'This bill is now on your account.' })
        }
      })
    }, 1500)
    return () => window.clearInterval(tick)
  }, [applyScannedQr, markCustomerScanned, pending])

  if (!pending) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <p className="text-muted-foreground">No live transaction. Create one first.</p>
        <Button className="mt-6" onClick={() => navigate('/shopkeeper/create')}>
          Create transaction
        </Button>
      </div>
    )
  }

  const status = pending.status

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <p className="text-[13px] text-accent">QR is live</p>
        <h1 className="mt-2 font-display text-5xl text-foreground">{pending.merchant}</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Ask the customer to open their phone camera and point it at this code. When they confirm, the bill
          posts to your account.
        </p>
        <div className="mt-6 rounded-[24px] bg-card px-4 py-4">
          {status === 'waiting' ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="size-4 animate-spin" /> Waiting for a phone camera scan
            </p>
          ) : null}
          {status === 'scanned' ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 text-sm text-primary"
            >
              <Check className="size-4" /> Customer scanned
            </motion.p>
          ) : null}
          {status === 'confirmed' ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 text-sm text-primary"
            >
              <Check className="size-4" /> Posted to your account
            </motion.p>
          ) : null}
        </div>

        {status === 'waiting' ? (
          <Button
            className="mt-5"
            variant="secondary"
            onClick={() => {
              const tx = confirmFromMerchant()
              toast.success('Added to account')
              if (tx) void playConfirmation(tx.amount, false)
            }}
          >
            Post without scan
          </Button>
        ) : null}

        {status === 'confirmed' ? (
          <Button className="mt-5" variant="secondary" onClick={() => navigate('/shopkeeper')}>
            Back to store
          </Button>
        ) : null}
      </div>
      <QRGenerator pending={pending} />
    </div>
  )
}

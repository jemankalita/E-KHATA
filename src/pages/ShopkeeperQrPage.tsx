import { QRGenerator } from '@/components/QRGenerator'
import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { playConfirmation } from '@/lib/voice'
import { motion } from 'framer-motion'
import { Check, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function ShopkeeperQrPage() {
  const { state, confirmFromMerchant } = useKhata()
  const navigate = useNavigate()
  const pending = state.pendingQr

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
        <div className="mt-6 rounded-[24px] bg-card px-4 py-4">
          {status === 'waiting' ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="size-4 animate-spin" /> Waiting to post this bill
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
              <Check className="size-4" /> Transaction confirmed
            </motion.p>
          ) : null}
        </div>

        {status === 'waiting' ? (
          <Button
            className="mt-5"
            onClick={() => {
              const tx = confirmFromMerchant()
              toast.success('Added to account', {
                description: 'The bill is on the shared khata. Customers do not scan this QR.',
              })
              if (tx) void playConfirmation(tx.amount, false)
            }}
          >
            Add to account
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

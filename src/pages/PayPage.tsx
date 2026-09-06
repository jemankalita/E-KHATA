import { TransactionConfirmation } from '@/components/TransactionConfirmation'
import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { fetchLiveQr, publishLiveQr } from '@/lib/liveQr'
import { parseKhataQrSearch } from '@/lib/khataQr'
import type { PendingQr } from '@/types'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export function PayPage() {
  const [params] = useSearchParams()
  const { setRole, applyScannedQr } = useKhata()
  const navigate = useNavigate()
  const fromUrl = parseKhataQrSearch(params)
  const [draft, setDraft] = useState<PendingQr | null>(fromUrl)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setRole('customer')
  }, [setRole])

  useEffect(() => {
    if (!fromUrl) return
    void fetchLiveQr(fromUrl.id).then((live) => {
      if (live) setDraft(live)
    })
  }, [fromUrl])

  return (
    <div className="min-h-svh bg-background">
      <PayInner
        draft={draft}
        done={done}
        setDone={setDone}
        applyScannedQr={applyScannedQr}
        navigate={navigate}
      />
    </div>
  )
}

function PayInner({
  draft,
  done,
  setDone,
  applyScannedQr,
  navigate,
}: {
  draft: PendingQr | null
  done: boolean
  setDone: (done: boolean) => void
  applyScannedQr: (pending: PendingQr) => unknown
  navigate: ReturnType<typeof useNavigate>
}) {
  if (!draft) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-muted-foreground">This QR has no bill on it.</p>
        <Button className="mt-6" onClick={() => navigate('/customer')}>
          Open customer khata
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
          <Check className="size-7" />
        </div>
        <h1 className="font-display text-4xl text-foreground">Posted to the shop</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {draft.merchant} now has this bill on their account, and it is on your khata.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button onClick={() => navigate('/customer/ledger')}>Open ledger</Button>
          <Button variant="secondary" onClick={() => navigate('/customer')}>
            Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <p className="text-[12px] uppercase tracking-[0.18em] text-primary">Phone camera scan</p>
      <h1 className="mt-2 mb-6 font-display text-4xl text-foreground">Add this bill?</h1>
      <TransactionConfirmation
        merchant={draft.merchant}
        items={draft.items}
        amount={draft.amount}
        transactionId={draft.id}
      />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => navigate('/customer')}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const posted = applyScannedQr(draft)
            void publishLiveQr({ ...draft, status: 'confirmed' })
            if (posted) {
              toast.success('Added to the shop account')
              setDone(true)
            }
          }}
        >
          Confirm & add
        </Button>
      </div>
    </div>
  )
}

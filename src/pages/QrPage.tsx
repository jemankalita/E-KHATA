import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerSelect } from '../components/CustomerSelect'
import { QrPanel } from '../components/QrPanel'
import { EmptyState } from '../components/ui/EmptyState'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { MERCHANT_NAME } from '../data/seed'
import { createReferenceId } from '../lib/format'
import { useKhata } from '../store/KhataStore'

export function QrPage() {
  const navigate = useNavigate()
  const { billDraft, selectedCustomer, confirmScan, registerIntent } = useKhata()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const referenceId = useMemo(() => createReferenceId(), [])

  const registered = useRef<string | null>(null)
  useEffect(() => {
    const key = `${referenceId}:${selectedCustomer.id}:${billDraft?.totalAmount ?? 0}`
    if (!billDraft || registered.current === key) return
    registered.current = key
    void registerIntent({
      merchantName: billDraft.merchantName || MERCHANT_NAME,
      amount: billDraft.totalAmount,
      items: billDraft.extractedItems,
      paymentMode: 'ocr-qr',
      referenceId,
      customerId: selectedCustomer.id,
    })
  }, [billDraft, referenceId, registerIntent, selectedCustomer.id])

  if (!billDraft) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          title="No bill confirmed yet"
          body="Upload and match a bill first, then raise a counter QR and post it to an account."
          action={<PrimaryButton onClick={() => navigate('/shop/upload')}>Upload bill</PrimaryButton>}
        />
      </div>
    )
  }

  const merchantName = billDraft.merchantName || MERCHANT_NAME
  const payload = `ekhata:${selectedCustomer.id}:${referenceId}:${billDraft.totalAmount}`

  async function postToAccount() {
    setBusy(true)
    setError(null)
    try {
      await confirmScan(referenceId)
      navigate('/shop/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this bill to the account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">Bill QR</p>
        <h2 className="font-display mt-1 text-[38px] font-normal leading-none">Counter QR</h2>
        <p className="mt-3 text-pretty text-sm text-ash">
          The matched bill becomes a shopkeeper QR. Post it to the account — customers cannot read it.
        </p>
      </div>
      <CustomerSelect />
      {error ? (
        <p role="alert" className="rounded-[8px] bg-orchid-bloom/15 px-4 py-3 text-sm text-orchid-bloom">
          {error}
        </p>
      ) : null}
      <QrPanel
        amount={billDraft.totalAmount}
        customerName={selectedCustomer.name}
        merchantName={merchantName}
        referenceId={referenceId}
        payload={payload}
        busy={busy}
        onPost={() => void postToAccount()}
      />
    </div>
  )
}

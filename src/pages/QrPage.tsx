import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrPanel } from '../components/QrPanel'
import { EmptyState } from '../components/ui/EmptyState'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { MERCHANT_NAME } from '../data/seed'
import { createReferenceId } from '../lib/format'
import { buildPayUrl } from '../lib/payLink'
import { playConfirmation } from '../lib/voice'
import { useKhata } from '../store/KhataStore'

export function QrPage() {
  const navigate = useNavigate()
  const { billDraft, selectedCustomer, confirmScan, registerIntent, lastTransaction, waitingRef } = useKhata()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const referenceId = useMemo(() => createReferenceId(), [])
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

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

  useEffect(() => {
    if (lastTransaction?.referenceId !== referenceId) return
    if (!lastTransaction.voicePlayed) void playConfirmation(lastTransaction.amount, false)
    navigate('/shop/success')
  }, [lastTransaction, navigate, referenceId])

  if (!billDraft) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          title="No bill confirmed yet"
          body="Generate the QR from a scanned bill so the amount and items are attached to it."
          action={<PrimaryButton onClick={() => navigate('/shop/upload')}>Upload bill</PrimaryButton>}
        />
      </div>
    )
  }

  const merchantName = billDraft.merchantName || MERCHANT_NAME
  const payload = buildPayUrl({
    origin,
    referenceId,
    customerId: selectedCustomer.id,
    amount: billDraft.totalAmount,
    merchantName,
    paymentMode: 'ocr-qr',
  })

  async function onScan() {
    setBusy(true)
    setError(null)
    try {
      await confirmScan(referenceId)
      navigate('/shop/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this bill to the khata.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Bill QR</p>
        <h2 className="font-display mt-1 text-3xl sm:text-4xl">Customer scan</h2>
      </div>
      {error ? (
        <p role="alert" className="rounded-2xl bg-clay-400/10 px-4 py-3 text-center text-sm text-clay-400">
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
        waiting={waitingRef === referenceId}
        onSimulateScan={() => void onScan()}
      />
    </div>
  )
}

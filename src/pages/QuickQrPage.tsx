import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerSelect } from '../components/CustomerSelect'
import { QrPanel } from '../components/QrPanel'
import { Card } from '../components/ui/Card'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { MERCHANT_NAME } from '../data/seed'
import { createReferenceId } from '../lib/format'
import { buildPayUrl } from '../lib/payLink'
import { playConfirmation } from '../lib/voice'
import { useKhata } from '../store/KhataStore'

function validate(customerPhone: string, customerId: string, amount: string): string | null {
  if (!customerId || !customerPhone) return 'Select a customer by phone or ID first.'
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) return 'Enter a bill amount greater than zero.'
  if (value > 100000) return 'Amounts over ₹1,00,000 need a manual entry.'
  return null
}

export function QuickQrPage() {
  const navigate = useNavigate()
  const merchantId = useId()
  const amountId = useId()
  const { selectedCustomer, setQuickQr, confirmScan, registerIntent, quickQr, lastTransaction, waitingRef } = useKhata()
  const [amount, setAmount] = useState('120')
  const [merchantName, setMerchantName] = useState(MERCHANT_NAME)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

  useEffect(() => {
    if (!quickQr || lastTransaction?.referenceId !== quickQr.referenceId) return
    if (!lastTransaction.voicePlayed) void playConfirmation(lastTransaction.amount, false)
    navigate('/shop/success')
  }, [lastTransaction, navigate, quickQr])

  async function generate() {
    const problem = validate(selectedCustomer.phone, selectedCustomer.id, amount)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    const value = Number(amount)
    const referenceId = createReferenceId()
    setQuickQr({
      amount: value,
      customerId: selectedCustomer.id,
      merchantName,
      referenceId,
      qrPayload: buildPayUrl({
        origin,
        referenceId,
        customerId: selectedCustomer.id,
        amount: value,
        merchantName,
        paymentMode: 'quick-qr',
      }),
    })
    await registerIntent({
      merchantName,
      amount: value,
      items: [],
      paymentMode: 'quick-qr',
      referenceId,
      customerId: selectedCustomer.id,
    })
  }

  async function onScan() {
    if (!quickQr) return
    setBusy(true)
    setError(null)
    try {
      await confirmScan(quickQr.referenceId)
      navigate('/shop/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this bill to the khata.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Fast path</p>
        <h2 className="font-display mt-1 text-3xl sm:text-4xl">Quick QR</h2>
        <p className="mt-2 text-pretty text-sm text-paper-400">
          Amount → QR → customer scan → khata. OCR is skipped for over-the-counter totals.
        </p>
      </div>

      <Card className="space-y-4 p-5 sm:p-6">
        <CustomerSelect />
        <div className="text-sm">
          <label
            htmlFor={merchantId}
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-400"
          >
            Merchant name
          </label>
          <input
            id={merchantId}
            className="min-h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-paper-50 transition-[border-color] duration-150 focus:border-teal-400"
            value={merchantName}
            onChange={(event) => setMerchantName(event.target.value)}
          />
        </div>
        <div className="text-sm">
          <label
            htmlFor={amountId}
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-400"
          >
            Enter bill amount
          </label>
          <input
            id={amountId}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            aria-describedby={error ? `${amountId}-error` : undefined}
            className="tabular min-h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-paper-50 transition-[border-color] duration-150 focus:border-teal-400"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        {error ? (
          <p id={`${amountId}-error`} role="alert" className="rounded-2xl bg-clay-400/10 px-3 py-2 text-sm text-clay-400">
            {error}
          </p>
        ) : null}
        <PrimaryButton className="w-full" onClick={() => void generate()}>
          Generate Payment QR
        </PrimaryButton>
      </Card>

      {quickQr ? (
        <QrPanel
          amount={quickQr.amount}
          customerName={selectedCustomer.name}
          merchantName={quickQr.merchantName}
          referenceId={quickQr.referenceId}
          payload={quickQr.qrPayload}
          busy={busy}
          waiting={waitingRef === quickQr.referenceId}
          onSimulateScan={() => void onScan()}
        />
      ) : null}
    </div>
  )
}

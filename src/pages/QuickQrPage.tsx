import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerSelect } from '../components/CustomerSelect'
import { QrPanel } from '../components/QrPanel'
import { Card } from '../components/ui/Card'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { MERCHANT_NAME } from '../data/seed'
import { createReferenceId } from '../lib/format'
import { useKhata } from '../store/KhataStore'

function validate(customerId: string, amount: string): string | null {
  if (!customerId) return 'Select an account first.'
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) return 'Enter a bill amount greater than zero.'
  if (value > 100000) return 'Amounts over ₹1,00,000 need a manual entry.'
  return null
}

export function QuickQrPage() {
  const navigate = useNavigate()
  const merchantId = useId()
  const amountId = useId()
  const { selectedCustomer, setQuickQr, confirmScan, registerIntent, quickQr } = useKhata()
  const [amount, setAmount] = useState('120')
  const [merchantName, setMerchantName] = useState(MERCHANT_NAME)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    const problem = validate(selectedCustomer.id, amount)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    const value = Number(amount)
    const referenceId = createReferenceId()
    const payload = `ekhata:${selectedCustomer.id}:${referenceId}:${value}`
    setQuickQr({
      amount: value,
      customerId: selectedCustomer.id,
      merchantName,
      referenceId,
      qrPayload: payload,
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

  async function postToAccount() {
    if (!quickQr) return
    setBusy(true)
    setError(null)
    try {
      await confirmScan(quickQr.referenceId)
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
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">Fast path</p>
        <h2 className="font-display mt-1 text-[38px] font-normal leading-none">Quick QR</h2>
        <p className="mt-3 text-pretty text-sm text-ash">
          Raise a counter QR, then post it to the selected account. Customers cannot read this QR.
        </p>
      </div>

      <Card className="space-y-4">
        <CustomerSelect />
        <div className="text-sm">
          <label htmlFor={merchantId} className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
            Merchant name
          </label>
          <input
            id={merchantId}
            className="field"
            value={merchantName}
            onChange={(event) => setMerchantName(event.target.value)}
          />
        </div>
        <div className="text-sm">
          <label htmlFor={amountId} className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
            Enter bill amount
          </label>
          <input
            id={amountId}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            aria-describedby={error ? `${amountId}-error` : undefined}
            className="field tabular"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        {error ? (
          <p id={`${amountId}-error`} role="alert" className="rounded-[8px] bg-orchid-bloom/15 px-3 py-2 text-sm text-orchid-bloom">
            {error}
          </p>
        ) : null}
        <PrimaryButton className="w-full" onClick={() => void generate()}>
          Generate counter QR
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
          onPost={() => void postToAccount()}
        />
      ) : null}
    </div>
  )
}

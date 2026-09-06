import { QRCodeSVG } from 'qrcode.react'
import { PrimaryButton } from './ui/PrimaryButton'
import { Card } from './ui/Card'
import { formatRupee } from '../lib/format'

interface QrPanelProps {
  amount: number
  customerName: string
  merchantName: string
  referenceId: string
  payload: string
  onPost: () => void
  busy?: boolean
}

export function QrPanel({
  amount,
  customerName,
  merchantName,
  referenceId,
  payload,
  onPost,
  busy,
}: QrPanelProps) {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">Shopkeeper QR</p>
      <p className="font-display mt-2 text-3xl font-light tabular text-cloud sm:text-4xl">{formatRupee(amount)}</p>

      <div className="mx-auto mt-6 w-fit rounded-[16px] bg-pure p-3">
        <QRCodeSVG value={payload} size={168} level="M" className="h-[168px] w-[168px] sm:h-[196px] sm:w-[196px]" />
      </div>

      <dl className="mt-6 space-y-2 text-sm text-ash">
        <div className="flex justify-between gap-4">
          <dt>Account</dt>
          <dd className="min-w-0 truncate text-cloud">{customerName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Merchant</dt>
          <dd className="min-w-0 truncate text-cloud">{merchantName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Reference</dt>
          <dd className="font-mono tabular text-cloud">{referenceId}</dd>
        </div>
      </dl>

      <PrimaryButton className="mt-6 w-full" disabled={busy} onClick={onPost}>
        {busy ? 'Posting…' : `Post to ${customerName}`}
      </PrimaryButton>
      <p className="mt-3 text-pretty text-xs text-fog">
        This QR stays on the counter. The customer account has no way to read it.
      </p>
    </Card>
  )
}

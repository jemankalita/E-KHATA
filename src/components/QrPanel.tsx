import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Copy, Smartphone } from 'lucide-react'
import { PrimaryButton } from './ui/PrimaryButton'
import { Card } from './ui/Card'
import { formatRupee } from '../lib/format'
import { motionTokens, springs } from '../lib/motion-tokens'

interface QrPanelProps {
  amount: number
  customerName: string
  merchantName: string
  referenceId: string
  payload: string
  onSimulateScan: () => void
  busy?: boolean
  waiting?: boolean
}

function CopyLinkButton({ payload }: { payload: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <PrimaryButton variant="secondary" className="w-full" onClick={() => void copy()}>
      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      {copied ? 'Link copied' : 'Copy pay link'}
    </PrimaryButton>
  )
}

export function QrPanel({
  amount,
  customerName,
  merchantName,
  referenceId,
  payload,
  onSimulateScan,
  busy,
  waiting,
}: QrPanelProps) {
  const reduce = useReducedMotion()
  const isHttp = payload.startsWith('http')

  return (
    <Card className="mx-auto max-w-md p-5 text-center sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-400">Scan to add to E-Khata</p>
      <p className="font-display mt-2 text-3xl tabular sm:text-4xl">{formatRupee(amount)}</p>

      <motion.div
        initial={{ opacity: 0, scale: reduce ? 1 : motionTokens.scale.subtle }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springs.gentle}
        className="mx-auto mt-6 w-fit rounded-[24px] bg-white p-3 shadow-[0_12px_40px_-24px_rgba(28,28,25,0.5)] sm:p-4"
        style={reduce ? undefined : { transform: 'perspective(800px) rotateX(6deg)' }}
      >
        <QRCodeSVG value={payload} size={168} level="M" className="h-[168px] w-[168px] sm:h-[196px] sm:w-[196px]" />
      </motion.div>

      <dl className="mt-6 space-y-2 text-sm text-paper-200">
        <div className="flex justify-between gap-4">
          <dt className="text-paper-400">Customer</dt>
          <dd className="min-w-0 truncate">{customerName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-paper-400">Merchant</dt>
          <dd className="min-w-0 truncate">{merchantName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-paper-400">Reference</dt>
          <dd className="tabular">{referenceId}</dd>
        </div>
      </dl>

      {waiting ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-teal-400/10 px-3 py-2 text-sm text-teal-500"
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-teal-400"
            animate={reduce ? undefined : { opacity: [1, 0.25, 1], scale: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: motionTokens.duration.crawl }}
          />
          Waiting for the customer phone to confirm…
        </p>
      ) : null}

      <div className="mt-6 grid gap-2">
        <PrimaryButton className="w-full" disabled={busy} onClick={onSimulateScan}>
          <Smartphone size={16} aria-hidden="true" />
          {busy ? 'Adding…' : 'Simulate Customer Scan'}
        </PrimaryButton>
        {isHttp ? <CopyLinkButton payload={payload} /> : null}
      </div>

      <p className="mt-3 text-pretty text-xs text-paper-400">
        {isHttp
          ? 'A phone camera opens this link directly. On one laptop use Simulate, or open the link in a second tab.'
          : 'This QR is not a web link.'}
      </p>
      {isHttp ? <p className="mt-2 break-all text-[11px] text-paper-400">{payload}</p> : null}
    </Card>
  )
}

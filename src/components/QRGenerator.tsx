import { QRCodeSVG } from 'qrcode.react'
import { buildKhataQrUrl } from '@/lib/khataQr'
import { formatInr } from '@/lib/utils'
import type { PendingQr } from '@/types'

export function QRGenerator({ pending }: { pending: PendingQr }) {
  const payload = buildKhataQrUrl(
    typeof window === 'undefined' ? 'http://localhost:5173' : window.location.origin,
    pending,
  )

  return (
    <div className="rounded-[28px] bg-card p-6 text-center">
      <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        E-Khata transaction
      </p>
      <h2 className="mt-2 font-display text-3xl text-foreground">{pending.merchant}</h2>
      <p className="mt-1 text-2xl text-primary">{formatInr(pending.amount)}</p>
      <div className="mx-auto mt-6 w-fit rounded-[18px] bg-white p-4">
        <QRCodeSVG value={payload} size={196} level="M" bgColor="#ffffff" fgColor="#080B10" />
      </div>
      <p className="mt-5 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        Transaction ID
      </p>
      <p className="mt-1 font-mono text-sm text-foreground">{pending.id}</p>
      <p className="mt-4 break-all text-[11px] leading-relaxed text-muted-foreground">{payload}</p>
    </div>
  )
}

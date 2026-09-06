import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/types'

export function StatusBadge({
  status,
  source,
}: {
  status: VerificationStatus
  source?: 'QR' | 'RFID'
}) {
  const verified = status === 'verified'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px]',
        verified ? 'bg-accent/20 text-accent' : 'bg-primary/15 text-primary',
      )}
    >
      {source ? `${source} · ` : ''}
      {verified ? 'Verified' : 'Pending'}
    </span>
  )
}

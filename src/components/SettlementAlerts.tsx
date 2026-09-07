import { useKhata } from '@/hooks/useKhata'
import { formatInr } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function SettlementAlerts() {
  const { role, state, markNoticesSeen } = useKhata()
  const toasted = useRef(new Set<string>())

  useEffect(() => {
    const fresh = state.notices.filter((notice) => !notice.seen && !toasted.current.has(notice.id))
    if (fresh.length === 0) return
    for (const notice of fresh) {
      toasted.current.add(notice.id)
      if (role === 'shopkeeper') {
        toast.success(`${notice.customerName} settled`, {
          description: `${formatInr(notice.amount)} · ${notice.merchant}`,
        })
      } else if (notice.kind === 'auto') {
        toast.success('Khata settled', {
          description: `${formatInr(notice.amount)} at ${notice.merchant} is cleared.`,
        })
      }
    }
    markNoticesSeen(fresh.map((notice) => notice.id))
  }, [markNoticesSeen, role, state.notices])

  return null
}

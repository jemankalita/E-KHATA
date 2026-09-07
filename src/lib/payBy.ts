export type PayByPreset = '1h' | 'today' | '3d' | '7d' | '30d'

export const PAY_BY_PRESETS: { id: PayByPreset; label: string }[] = [
  { id: '1h', label: '1 hour' },
  { id: 'today', label: 'Today' },
  { id: '3d', label: '3 days' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
]

export function payByFromPreset(preset: PayByPreset, now = new Date()): string {
  const at = new Date(now.getTime())
  if (preset === '1h') {
    at.setHours(at.getHours() + 1)
    return at.toISOString()
  }
  if (preset === 'today') {
    at.setHours(23, 59, 0, 0)
    return at.toISOString()
  }
  const days = preset === '3d' ? 3 : preset === '7d' ? 7 : 30
  at.setDate(at.getDate() + days)
  return at.toISOString()
}

export function isOverdue(iso: string, now = new Date()): boolean {
  return Date.parse(iso) < now.getTime()
}

export function formatPayBy(iso: string): string {
  const due = new Date(iso)
  const when = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(due)
  return `Pay by ${when}`
}

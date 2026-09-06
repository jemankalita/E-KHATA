export function formatRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function createReferenceId(prefix = 'EKH'): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${n}`
}

export function buildQrPayload(referenceId: string, amount: number): string {
  return `ekhata://pay?ref=${encodeURIComponent(referenceId)}&amount=${amount}`
}

export function parseQrPayload(payload: string): { ref: string; amount: number } | null {
  try {
    const url = new URL(payload.replace('ekhata://', 'https://ekhata.local/'))
    const ref = url.searchParams.get('ref')
    const amount = Number(url.searchParams.get('amount'))
    if (!ref || !Number.isFinite(amount)) return null
    return { ref, amount }
  } catch {
    return null
  }
}

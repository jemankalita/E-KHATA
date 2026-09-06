import type { PendingQr } from '@/types'

const STORAGE_KEY = 'e-khata-live-qr-v1'

function readMap(): Record<string, PendingQr> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, PendingQr>
  } catch {
    return {}
  }
}

function writeLocal(pending: PendingQr) {
  try {
    const next = { ...readMap(), [pending.id]: pending }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function readLiveQrLocal(id: string): PendingQr | null {
  return readMap()[id] ?? null
}

export async function publishLiveQr(pending: PendingQr): Promise<void> {
  writeLocal(pending)
  try {
    await fetch(`/api/live-qr/${encodeURIComponent(pending.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending),
    })
  } catch {
    /* local copy is enough for same-device tabs */
  }
}

export async function fetchLiveQr(id: string): Promise<PendingQr | null> {
  try {
    const res = await fetch(`/api/live-qr/${encodeURIComponent(id)}`)
    if (res.ok) return (await res.json()) as PendingQr
  } catch {
    /* fall through */
  }
  return readLiveQrLocal(id)
}

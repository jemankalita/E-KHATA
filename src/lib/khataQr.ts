import type { PendingQr, TransactionItem } from '@/types'

function encodeItems(items: TransactionItem[]): string {
  return items.map((item) => `${item.name}~${item.quantity}~${item.price}`).join('_')
}

function decodeItems(raw: string | null): TransactionItem[] {
  if (!raw) return []
  return raw
    .split('_')
    .map((part) => {
      const [name, qty, price] = part.split('~')
      const quantity = Number(qty)
      const unit = Number(price)
      if (!name || !Number.isFinite(quantity) || !Number.isFinite(unit)) return null
      return { name, quantity, price: unit }
    })
    .filter((item): item is TransactionItem => item !== null)
}

export function buildKhataQrUrl(origin: string, pending: PendingQr): string {
  const url = new URL('/pay', origin)
  url.searchParams.set('ref', pending.id)
  url.searchParams.set('m', pending.merchant)
  url.searchParams.set('c', pending.customerName)
  url.searchParams.set('a', String(pending.amount))
  url.searchParams.set('cat', pending.category)
  url.searchParams.set('i', encodeItems(pending.items))
  url.searchParams.set('s', pending.status)
  return url.toString()
}

export function parseKhataQrSearch(search: URLSearchParams): PendingQr | null {
  const id = search.get('ref')
  const merchant = search.get('m') ?? search.get('merchant')
  const customerName = search.get('c') ?? search.get('customer') ?? ''
  const amount = Number(search.get('a') ?? search.get('amount'))
  const category = search.get('cat') ?? search.get('category') ?? 'Groceries'
  const items = decodeItems(search.get('i') ?? search.get('items'))
  if (!id || !merchant || !Number.isFinite(amount) || amount <= 0) return null
  return {
    id,
    merchant,
    customerName: customerName || 'Customer',
    items,
    amount,
    category,
    status: 'waiting',
  }
}

export function parseKhataQrValue(raw: string): PendingQr | null {
  const text = raw.trim()
  if (!text) return null

  try {
    if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/pay')) {
      const url = text.startsWith('/pay') ? new URL(text, 'https://e-khata.local') : new URL(text)
      return parseKhataQrSearch(url.searchParams)
    }
  } catch {
    return null
  }

  try {
    const parsed = JSON.parse(text) as {
      id?: string
      merchant?: string
      customerName?: string
      amount?: number
      category?: string
      items?: TransactionItem[]
    }
    if (!parsed.id || !parsed.merchant || !Number.isFinite(parsed.amount) || (parsed.amount ?? 0) <= 0) {
      return null
    }
    return {
      id: parsed.id,
      merchant: parsed.merchant,
      customerName: parsed.customerName ?? 'Customer',
      items: parsed.items ?? [],
      amount: parsed.amount ?? 0,
      category: parsed.category ?? 'Groceries',
      status: 'waiting',
    }
  } catch {
    return null
  }
}

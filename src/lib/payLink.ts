import type { Customer, Item, PaymentMode, Transaction } from '../legacy/types'

export interface KhataSnapshot {
  customers: Customer[]
  transactions: Transaction[]
}

export interface PayIntent {
  referenceId: string
  customerId: string
  merchantName: string
  amount: number
  items: Item[]
  paymentMode: PaymentMode
  createdAt: string
  status: 'waiting' | 'confirmed'
}

export function buildPayUrl(input: {
  origin: string
  referenceId: string
  customerId: string
  amount: number
  merchantName: string
  paymentMode: PaymentMode
}): string {
  const url = new URL('/pay', input.origin)
  url.searchParams.set('ref', input.referenceId)
  url.searchParams.set('amount', String(input.amount))
  url.searchParams.set('customerId', input.customerId)
  url.searchParams.set('merchant', input.merchantName)
  url.searchParams.set('mode', input.paymentMode)
  return url.toString()
}

export function parsePaySearch(search: URLSearchParams): {
  ref: string
  amount: number
  customerId: string
  merchant: string
  mode: PaymentMode
} | null {
  const ref = search.get('ref')
  const amount = Number(search.get('amount'))
  const customerId = search.get('customerId')
  const merchant = search.get('merchant') ?? ''
  const mode = (search.get('mode') as PaymentMode | null) ?? 'qr'
  if (!ref || !customerId || !Number.isFinite(amount) || amount <= 0) return null
  return { ref, amount, customerId, merchant, mode }
}

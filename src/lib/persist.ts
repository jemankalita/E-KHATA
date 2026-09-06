import type { KhataSnapshot } from './payLink'
import type { Customer, Item, PaymentMode, Transaction } from '../types'
import { addToKhata, autoSettleDue, settleCustomer } from './khata'
import { CUSTOMERS, TRANSACTIONS } from '../data/seed'

const KEY = 'ekhata-state-v1'

export function readLocalSnapshot(): KhataSnapshot {
  if (typeof window === 'undefined') {
    return { customers: CUSTOMERS, transactions: TRANSACTIONS }
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { customers: CUSTOMERS, transactions: TRANSACTIONS }
    const parsed = JSON.parse(raw) as KhataSnapshot
    if (!Array.isArray(parsed.customers) || !Array.isArray(parsed.transactions)) {
      return { customers: CUSTOMERS, transactions: TRANSACTIONS }
    }
    return parsed
  } catch {
    return { customers: CUSTOMERS, transactions: TRANSACTIONS }
  }
}

export function writeLocalSnapshot(snapshot: KhataSnapshot) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(snapshot))
}

export async function fetchSnapshot(): Promise<KhataSnapshot> {
  try {
    const response = await fetch('/api/state')
    if (!response.ok) throw new Error('state unavailable')
    const data = (await response.json()) as KhataSnapshot
    const settled = autoSettleDue(data.customers, data.transactions)
    const snapshot = { customers: settled.customers, transactions: settled.transactions }
    writeLocalSnapshot(snapshot)
    return snapshot
  } catch {
    const local = readLocalSnapshot()
    const settled = autoSettleDue(local.customers, local.transactions)
    return { customers: settled.customers, transactions: settled.transactions }
  }
}

export async function createIntent(input: {
  referenceId: string
  customerId: string
  merchantName: string
  amount: number
  items: Item[]
  paymentMode: PaymentMode
}) {
  const response = await fetch('/api/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const error = (await response.json().catch(() => ({ error: 'Could not create QR.' }))) as { error?: string }
    throw new Error(error.error ?? 'Could not create QR.')
  }
}

export async function confirmIntent(referenceId: string): Promise<{
  customers: Customer[]
  transactions: Transaction[]
  transaction: Transaction
}> {
  const response = await fetch(`/api/intent/${encodeURIComponent(referenceId)}/confirm`, { method: 'POST' })
  const data = (await response.json()) as {
    error?: string
    customers?: Customer[]
    transactions?: Transaction[]
    transaction?: Transaction
  }
  if (!response.ok || !data.customers || !data.transactions || !data.transaction) {
    throw new Error(data.error ?? 'Could not confirm this QR.')
  }
  writeLocalSnapshot({ customers: data.customers, transactions: data.transactions })
  return {
    customers: data.customers,
    transactions: data.transactions,
    transaction: data.transaction,
  }
}

export async function confirmIntentLocal(
  snapshot: KhataSnapshot,
  input: {
    customer: Customer
    merchantName: string
    amount: number
    items: Item[]
    paymentMode: PaymentMode
    referenceId: string
  },
) {
  const result = addToKhata(snapshot.customers, snapshot.transactions, input)
  writeLocalSnapshot({ customers: result.customers, transactions: result.transactions })
  return result
}

export async function settleRemote(customerId: string) {
  const response = await fetch('/api/settle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId }),
  })
  const data = (await response.json()) as {
    error?: string
    customers?: Customer[]
    transactions?: Transaction[]
    settledAmount?: number
  }
  if (!response.ok || !data.customers || !data.transactions) {
    throw new Error(data.error ?? 'Could not settle.')
  }
  writeLocalSnapshot({ customers: data.customers, transactions: data.transactions })
  return { customers: data.customers, transactions: data.transactions, settledAmount: data.settledAmount ?? 0 }
}

export function settleLocal(snapshot: KhataSnapshot, customerId: string) {
  const result = settleCustomer(snapshot.customers, snapshot.transactions, customerId)
  writeLocalSnapshot({ customers: result.customers, transactions: result.transactions })
  return result
}

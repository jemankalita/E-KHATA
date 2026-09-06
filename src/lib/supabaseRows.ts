import type { Customer, Item, PaymentMode, Transaction, TransactionStatus } from '../legacy/types'
import type { PayIntent } from './payLink'

export interface CustomerRow {
  id: string
  name: string
  phone: string
  current_balance: number | string
  last_settlement_date: string | null
  next_settlement_date: string
}

export interface TransactionRow {
  id: string
  customer_id: string
  merchant_name: string
  items: unknown
  amount: number | string
  status: TransactionStatus
  payment_mode: PaymentMode
  reference_id: string
  occurred_at: string
  voice_played: boolean
  settlement_state: 'open' | 'settled'
}

export interface PayIntentRow {
  reference_id: string
  customer_id: string
  merchant_name: string
  amount: number | string
  items: unknown
  payment_mode: PaymentMode
  created_at: string
  status: 'waiting' | 'confirmed'
}

export function toRupees(value: unknown): number {
  const amount = typeof value === 'string' ? Number(value) : value
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new Error('This record has an unreadable amount. Please refresh and try again.')
  }
  return amount
}

function toIsoTime(value: unknown, label: string): string {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new Error(`This ${label} has an unreadable date. Please refresh and try again.`)
  }
  return new Date(value).toISOString()
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function toItems(value: unknown): Item[] {
  if (!Array.isArray(value)) return []
  return value.reduce<Item[]>((accumulator, entry) => {
    if (typeof entry !== 'object' || entry === null) return accumulator
    const raw = entry as Record<string, unknown>
    return [
      ...accumulator,
      {
        name: toText(raw.name),
        quantity: toNumber(raw.quantity),
        price: toNumber(raw.price),
        matchedProductId: typeof raw.matchedProductId === 'string' ? raw.matchedProductId : null,
        confidence: toNumber(raw.confidence),
      },
    ]
  }, [])
}

export function toCustomer(row: CustomerRow): Customer {
  if (!row.id || !row.name) {
    throw new Error('A customer record arrived incomplete. Please refresh the khata.')
  }
  return {
    id: row.id,
    name: row.name,
    phone: toText(row.phone),
    currentBalance: toRupees(row.current_balance),
    lastSettlementDate:
      row.last_settlement_date === null ? null : toIsoTime(row.last_settlement_date, 'customer'),
    nextSettlementDate: toIsoTime(row.next_settlement_date, 'customer'),
  }
}

export function toCustomerRow(customer: Customer): CustomerRow {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    current_balance: customer.currentBalance,
    last_settlement_date: customer.lastSettlementDate,
    next_settlement_date: customer.nextSettlementDate,
  }
}

export function toTransaction(row: TransactionRow): Transaction {
  if (!row.id || !row.customer_id) {
    throw new Error('A transaction record arrived incomplete. Please refresh the khata.')
  }
  return {
    id: row.id,
    customerId: row.customer_id,
    merchantName: toText(row.merchant_name),
    items: toItems(row.items),
    amount: toRupees(row.amount),
    status: row.status,
    paymentMode: row.payment_mode,
    referenceId: toText(row.reference_id),
    timestamp: toIsoTime(row.occurred_at, 'transaction'),
    voicePlayed: row.voice_played === true,
    settlementState: row.settlement_state,
  }
}

export function toTransactionRow(transaction: Transaction): TransactionRow {
  return {
    id: transaction.id,
    customer_id: transaction.customerId,
    merchant_name: transaction.merchantName,
    items: transaction.items,
    amount: transaction.amount,
    status: transaction.status,
    payment_mode: transaction.paymentMode,
    reference_id: transaction.referenceId,
    occurred_at: transaction.timestamp,
    voice_played: transaction.voicePlayed,
    settlement_state: transaction.settlementState,
  }
}

export function toPayIntent(row: PayIntentRow): PayIntent {
  const amount = toRupees(row.amount)
  if (!row.reference_id || !row.customer_id || amount <= 0) {
    throw new Error('This QR has an invalid amount or is missing a customer. Ask for a new QR.')
  }
  return {
    referenceId: row.reference_id,
    customerId: row.customer_id,
    merchantName: toText(row.merchant_name),
    amount,
    items: toItems(row.items),
    paymentMode: row.payment_mode,
    createdAt: toIsoTime(row.created_at, 'QR'),
    status: row.status,
  }
}

export function toPayIntentRow(intent: PayIntent): PayIntentRow {
  return {
    reference_id: intent.referenceId,
    customer_id: intent.customerId,
    merchant_name: intent.merchantName,
    amount: intent.amount,
    items: intent.items,
    payment_mode: intent.paymentMode,
    created_at: intent.createdAt,
    status: intent.status,
  }
}

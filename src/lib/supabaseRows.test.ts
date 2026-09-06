import { describe, expect, it } from 'vitest'
import {
  toCustomer,
  toCustomerRow,
  toItems,
  toPayIntent,
  toPayIntentRow,
  toRupees,
  toTransaction,
  toTransactionRow,
  type CustomerRow,
  type PayIntentRow,
  type TransactionRow,
} from './supabaseRows'
import type { Customer, Item, Transaction } from '../legacy/types'
import type { PayIntent } from './payLink'

const customerRow: CustomerRow = {
  id: 'cust-aarav',
  name: 'Aarav Mehta',
  phone: '9876543210',
  current_balance: 1240,
  last_settlement_date: '2026-08-30T10:00:00+00:00',
  next_settlement_date: '2026-09-30T10:00:00+00:00',
}

const customer: Customer = {
  id: 'cust-aarav',
  name: 'Aarav Mehta',
  phone: '9876543210',
  currentBalance: 1240,
  lastSettlementDate: '2026-08-30T10:00:00.000Z',
  nextSettlementDate: '2026-09-30T10:00:00.000Z',
}

const items: Item[] = [
  { name: 'Milk', quantity: 2, price: 64, matchedProductId: 'milk', confidence: 0.96 },
]

const transactionRow: TransactionRow = {
  id: 'tx-sharma',
  customer_id: 'cust-aarav',
  merchant_name: 'Sharma Stores',
  items,
  amount: 105,
  status: 'verified',
  payment_mode: 'ocr-qr',
  reference_id: 'EKH-1041',
  occurred_at: '2026-09-05T18:20:00+00:00',
  voice_played: true,
  settlement_state: 'open',
}

const transaction: Transaction = {
  id: 'tx-sharma',
  customerId: 'cust-aarav',
  merchantName: 'Sharma Stores',
  items,
  amount: 105,
  status: 'verified',
  paymentMode: 'ocr-qr',
  referenceId: 'EKH-1041',
  timestamp: '2026-09-05T18:20:00.000Z',
  voicePlayed: true,
  settlementState: 'open',
}

describe('toRupees', () => {
  it('passes through a finite number', () => {
    expect(toRupees(105)).toBe(105)
  })

  it('parses the numeric strings PostgREST can emit', () => {
    expect(toRupees('105.50')).toBe(105.5)
  })

  it('rejects values that are not money', () => {
    expect(() => toRupees('not-a-number')).toThrow(/amount/i)
    expect(() => toRupees(null)).toThrow(/amount/i)
  })
})

describe('toItems', () => {
  it('keeps well-formed items', () => {
    expect(toItems(items)).toEqual(items)
  })

  it('returns an empty list for anything that is not an array', () => {
    expect(toItems(null)).toEqual([])
    expect(toItems('[]')).toEqual([])
  })

  it('drops entries that are not objects and normalises missing fields', () => {
    expect(toItems([null, 7, { name: 'Bread' }])).toEqual([
      { name: 'Bread', quantity: 0, price: 0, matchedProductId: null, confidence: 0 },
    ])
  })

  it('does not mutate the input array', () => {
    const input = [...items]
    toItems(input)
    expect(input).toEqual(items)
  })
})

describe('customer mapping', () => {
  it('maps a row to a domain customer with normalised ISO timestamps', () => {
    expect(toCustomer(customerRow)).toEqual(customer)
  })

  it('keeps a null last settlement date', () => {
    expect(toCustomer({ ...customerRow, last_settlement_date: null }).lastSettlementDate).toBeNull()
  })

  it('round-trips a domain customer through a row', () => {
    expect(toCustomer(toCustomerRow(customer))).toEqual(customer)
  })

  it('rejects a row without an id', () => {
    expect(() => toCustomer({ ...customerRow, id: '' })).toThrow(/customer/i)
  })
})

describe('transaction mapping', () => {
  it('maps a row to a domain transaction, renaming occurred_at to timestamp', () => {
    expect(toTransaction(transactionRow)).toEqual(transaction)
  })

  it('round-trips a domain transaction through a row', () => {
    expect(toTransaction(toTransactionRow(transaction))).toEqual(transaction)
  })

  it('writes the domain timestamp into occurred_at', () => {
    expect(toTransactionRow(transaction).occurred_at).toBe('2026-09-05T18:20:00.000Z')
  })

  it('rejects a row that is missing its customer link', () => {
    expect(() => toTransaction({ ...transactionRow, customer_id: '' })).toThrow(/transaction/i)
  })
})

describe('pay intent mapping', () => {
  const intent: PayIntent = {
    referenceId: 'EKH-2001',
    customerId: 'cust-priya',
    merchantName: 'Kalita Kirana',
    amount: 250,
    items,
    paymentMode: 'quick-qr',
    createdAt: '2026-09-06T10:00:00.000Z',
    status: 'waiting',
  }

  const intentRow: PayIntentRow = {
    reference_id: 'EKH-2001',
    customer_id: 'cust-priya',
    merchant_name: 'Kalita Kirana',
    amount: 250,
    items,
    payment_mode: 'quick-qr',
    created_at: '2026-09-06T10:00:00+00:00',
    status: 'waiting',
  }

  it('maps a row to a domain intent', () => {
    expect(toPayIntent(intentRow)).toEqual(intent)
  })

  it('round-trips a domain intent through a row', () => {
    expect(toPayIntent(toPayIntentRow(intent))).toEqual(intent)
  })

  it('rejects an intent row with a non-positive amount', () => {
    expect(() => toPayIntent({ ...intentRow, amount: 0 })).toThrow(/amount/i)
  })
})

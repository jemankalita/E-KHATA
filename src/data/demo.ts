import type {
  KhataState,
  PendingQr,
  Transaction,
  TransactionItem,
} from '@/types'

export const SETTLEMENT_ISO = '2026-09-30'
export const SETTLEMENT_LABEL = '30 September 2026'
export const CUSTOMER_NAME = 'Rahul Sharma'
export const MERCHANT_NAME = 'Sharma Stores'
export const STORAGE_KEY = 'e-khata-state-v1'

export const DEMO_QR_ITEMS: TransactionItem[] = [
  { name: 'Milk', quantity: 1, price: 32 },
  { name: 'Bread', quantity: 1, price: 45 },
  { name: 'Groceries', quantity: 1, price: 309 },
]

export const DEMO_QR_AMOUNT = 386
export const DEMO_QR_ID = 'EK-2026-000381'
export const RFID_FARE = 20
export const METRO_FARE = 50
export const CANTEEN_FARE = 100
export const STARTING_BALANCE = 1240
export const MERCHANT_OUTSTANDING = 18420

const verifiedAll = {
  qrPayload: true,
  merchantIdentity: true,
  amount: true,
  transactionId: true,
  customerConfirmation: true,
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'EK-2026-000378',
    merchant: MERCHANT_NAME,
    customerName: CUSTOMER_NAME,
    category: 'Groceries',
    amount: 386,
    items: DEMO_QR_ITEMS,
    source: 'QR',
    status: 'verified',
    timestamp: '2026-09-06T08:14:00.000Z',
    verification: verifiedAll,
    settled: false,
  },
  {
    id: 'EK-2026-000379',
    merchant: 'Campus Canteen',
    customerName: CUSTOMER_NAME,
    category: 'Food',
    amount: 80,
    items: [{ name: 'Lunch thali', quantity: 1, price: 80 }],
    source: 'QR',
    status: 'verified',
    timestamp: '2026-09-06T09:40:00.000Z',
    verification: verifiedAll,
    settled: false,
  },
  {
    id: 'EK-2026-000380',
    merchant: 'Bus Route 21G',
    customerName: CUSTOMER_NAME,
    category: 'RFID Transaction',
    amount: 20,
    items: [{ name: 'Fare', quantity: 1, price: 20 }],
    source: 'RFID',
    status: 'verified',
    timestamp: '2026-09-06T10:05:00.000Z',
    verification: {
      qrPayload: false,
      merchantIdentity: true,
      amount: true,
      transactionId: true,
      customerConfirmation: true,
    },
    settled: false,
  },
]

const listedInitial = INITIAL_TRANSACTIONS.reduce((sum, tx) => sum + tx.amount, 0)

export const INITIAL_STATE: KhataState = {
  customer: { name: CUSTOMER_NAME },
  merchant: {
    name: MERCHANT_NAME,
    outstanding: MERCHANT_OUTSTANDING,
    activeCustomers: 32,
    pendingConfirmations: 4,
  },
  wallet: {
    outstanding: STARTING_BALANCE,
    nextSettlement: SETTLEMENT_LABEL,
    carriedForward: STARTING_BALANCE - listedInitial,
  },
  settlement: {
    dateLabel: SETTLEMENT_LABEL,
    isoDate: SETTLEMENT_ISO,
    status: 'open',
  },
  transactions: INITIAL_TRANSACTIONS,
  pendingQr: null,
  shopkeeperRecent: [
    {
      id: 'EK-2026-000378',
      customerName: CUSTOMER_NAME,
      amount: 386,
      status: 'verified',
    },
    {
      id: 'sk-aman',
      customerName: 'Aman Verma',
      amount: 240,
      status: 'verified',
    },
    {
      id: 'sk-priya',
      customerName: 'Priya Singh',
      amount: 520,
      status: 'pending',
    },
  ],
  nextSequence: 382,
}

export function buildDefaultPendingQr(): PendingQr {
  return {
    id: DEMO_QR_ID,
    merchant: MERCHANT_NAME,
    customerName: CUSTOMER_NAME,
    items: DEMO_QR_ITEMS,
    amount: DEMO_QR_AMOUNT,
    category: 'Groceries',
    status: 'waiting',
  }
}

export function sumItems(items: TransactionItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
}

import type {
  KhataState,
  PendingQr,
  Transaction,
  TransactionItem,
} from '../types'

export const SETTLEMENT_ISO = '2026-09-30'
export const SETTLEMENT_LABEL = '30 September 2026'
export const CUSTOMER_NAME = 'Rahul Sharma'
export const MERCHANT_NAME = 'Sharma Stores'
export const STORAGE_KEY = 'e-khata-state-v3'

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

const settledGrocery = {
  category: 'Groceries' as const,
  items: [{ name: 'Kirana basket', quantity: 1, price: 0 }],
  source: 'QR' as const,
  status: 'verified' as const,
  verification: verifiedAll,
  settled: true,
  settlementSource: 'customer' as const,
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'EK-2026-000360',
    merchant: MERCHANT_NAME,
    customerName: CUSTOMER_NAME,
    ...settledGrocery,
    items: [{ name: 'Kirana basket', quantity: 1, price: 400 }],
    amount: 400,
    amountPaid: 400,
    timestamp: '2026-06-02T10:00:00.000Z',
    settledAt: '2026-06-06T10:00:00.000Z',
    payBy: '2026-06-30T18:00:00.000Z',
  },
  {
    id: 'EK-2026-000365',
    merchant: MERCHANT_NAME,
    customerName: CUSTOMER_NAME,
    ...settledGrocery,
    items: [{ name: 'Kirana basket', quantity: 1, price: 350 }],
    amount: 350,
    amountPaid: 350,
    timestamp: '2026-07-04T10:00:00.000Z',
    settledAt: '2026-07-10T10:00:00.000Z',
    payBy: '2026-07-31T18:00:00.000Z',
  },
  {
    id: 'EK-2026-000370',
    merchant: MERCHANT_NAME,
    customerName: CUSTOMER_NAME,
    ...settledGrocery,
    items: [{ name: 'Kirana basket', quantity: 1, price: 280 }],
    amount: 280,
    amountPaid: 280,
    timestamp: '2026-08-03T10:00:00.000Z',
    settledAt: '2026-08-08T10:00:00.000Z',
    payBy: '2026-08-31T18:00:00.000Z',
  },
  {
    id: 'EK-2026-000350',
    merchant: MERCHANT_NAME,
    customerName: 'Aman Verma',
    ...settledGrocery,
    items: [{ name: 'Rice', quantity: 1, price: 180 }],
    amount: 180,
    amountPaid: 180,
    timestamp: '2026-08-01T11:00:00.000Z',
    settledAt: '2026-08-20T11:00:00.000Z',
    payBy: '2026-08-31T18:00:00.000Z',
  },
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
    payBy: '2026-09-30T18:00:00.000Z',
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
    payBy: '2026-09-10T18:00:00.000Z',
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
    payBy: '2026-09-08T18:00:00.000Z',
  },
  {
    id: 'EK-2026-000376',
    merchant: MERCHANT_NAME,
    customerName: 'Aman Verma',
    category: 'Groceries',
    amount: 240,
    items: [{ name: 'Rice', quantity: 1, price: 240 }],
    source: 'QR',
    status: 'verified',
    timestamp: '2026-09-05T11:20:00.000Z',
    verification: verifiedAll,
    settled: false,
    payBy: '2026-09-15T18:00:00.000Z',
  },
  {
    id: 'EK-2026-000377',
    merchant: MERCHANT_NAME,
    customerName: 'Priya Singh',
    category: 'Groceries',
    amount: 520,
    items: [{ name: 'Monthly ration', quantity: 1, price: 520 }],
    source: 'QR',
    status: 'pending',
    timestamp: '2026-09-04T16:05:00.000Z',
    verification: verifiedAll,
    settled: false,
    payBy: '2026-09-12T18:00:00.000Z',
  },
]

const listedInitial = INITIAL_TRANSACTIONS.filter(
  (tx) => tx.customerName === CUSTOMER_NAME && !tx.settled,
).reduce((sum, tx) => sum + tx.amount, 0)

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
  ledgerEvents: [
    {
      id: 'pay-360',
      kind: 'payment',
      customerName: CUSTOMER_NAME,
      merchant: MERCHANT_NAME,
      timestamp: '2026-06-06T10:00:00.000Z',
      source: 'customer',
      transactionIds: ['EK-2026-000360'],
      amount: 400,
      paymentKind: 'full',
    },
    {
      id: 'pay-365',
      kind: 'payment',
      customerName: CUSTOMER_NAME,
      merchant: MERCHANT_NAME,
      timestamp: '2026-07-10T10:00:00.000Z',
      source: 'customer',
      transactionIds: ['EK-2026-000365'],
      amount: 350,
      paymentKind: 'full',
    },
    {
      id: 'pay-370',
      kind: 'payment',
      customerName: CUSTOMER_NAME,
      merchant: MERCHANT_NAME,
      timestamp: '2026-08-08T10:00:00.000Z',
      source: 'customer',
      transactionIds: ['EK-2026-000370'],
      amount: 280,
      paymentKind: 'full',
    },
    {
      id: 'pay-350',
      kind: 'payment',
      customerName: 'Aman Verma',
      merchant: MERCHANT_NAME,
      timestamp: '2026-08-20T11:00:00.000Z',
      source: 'customer',
      transactionIds: ['EK-2026-000350'],
      amount: 180,
      paymentKind: 'full',
    },
  ],
  notices: [],
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
    payBy: '2026-09-14T18:00:00.000Z',
  }
}

export function sumItems(items: TransactionItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
}

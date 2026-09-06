import type { Customer, Transaction } from '../types'

export const MERCHANT_NAME = 'Kalita Kirana'

export const CUSTOMERS: Customer[] = [
  {
    id: 'cust-aarav',
    name: 'Aarav Mehta',
    phone: '9876543210',
    currentBalance: 1240,
    lastSettlementDate: '2026-08-30T10:00:00.000Z',
    nextSettlementDate: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'cust-priya',
    name: 'Priya Sharma',
    phone: '9988776655',
    currentBalance: 0,
    lastSettlementDate: '2026-08-30T10:00:00.000Z',
    nextSettlementDate: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'cust-imran',
    name: 'Imran Khan',
    phone: '9123456780',
    currentBalance: 0,
    lastSettlementDate: null,
    nextSettlementDate: '2026-09-30T10:00:00.000Z',
  },
]

export const TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-sharma',
    customerId: 'cust-aarav',
    merchantName: 'Sharma Stores',
    items: [
      { name: 'Milk', quantity: 2, price: 64, matchedProductId: 'milk', confidence: 0.96 },
      { name: 'Bread', quantity: 1, price: 41, matchedProductId: 'bread', confidence: 0.94 },
    ],
    amount: 105,
    status: 'verified',
    paymentMode: 'ocr-qr',
    referenceId: 'EKH-1041',
    timestamp: '2026-09-05T18:20:00.000Z',
    voicePlayed: true,
    settlementState: 'open',
  },
  {
    id: 'tx-bus',
    customerId: 'cust-aarav',
    merchantName: 'Bus Route 21G',
    items: [{ name: 'Ticket', quantity: 1, price: 25, matchedProductId: null, confidence: 0.4 }],
    amount: 25,
    status: 'verified',
    paymentMode: 'quick-qr',
    referenceId: 'EKH-1042',
    timestamp: '2026-09-04T09:05:00.000Z',
    voicePlayed: true,
    settlementState: 'open',
  },
  {
    id: 'tx-canteen',
    customerId: 'cust-aarav',
    merchantName: 'Campus Canteen',
    items: [
      { name: 'Maggi', quantity: 1, price: 40, matchedProductId: 'maggi', confidence: 0.91 },
      { name: 'Chips', quantity: 2, price: 40, matchedProductId: 'chips', confidence: 0.9 },
    ],
    amount: 80,
    status: 'pending',
    paymentMode: 'qr',
    referenceId: 'EKH-1043',
    timestamp: '2026-09-03T13:40:00.000Z',
    voicePlayed: false,
    settlementState: 'open',
  },
]

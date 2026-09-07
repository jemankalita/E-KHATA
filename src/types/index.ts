export type Role = 'customer' | 'shopkeeper'

export type TransactionSource = 'QR' | 'RFID'

export type VerificationStatus = 'verified' | 'pending'

export interface TransactionItem {
  name: string
  quantity: number
  price: number
}

export interface TransactionVerification {
  qrPayload: boolean
  merchantIdentity: boolean
  amount: boolean
  transactionId: boolean
  customerConfirmation: boolean
}

export interface Transaction {
  id: string
  merchant: string
  customerName: string
  category: string
  amount: number
  items: TransactionItem[]
  source: TransactionSource
  status: VerificationStatus
  timestamp: string
  verification: TransactionVerification
  settled: boolean
  payBy: string
}

export interface Customer {
  name: string
}

export interface Merchant {
  name: string
  outstanding: number
  activeCustomers: number
  pendingConfirmations: number
}

export interface Wallet {
  outstanding: number
  nextSettlement: string
  carriedForward: number
}

export interface Settlement {
  dateLabel: string
  isoDate: string
  status: 'open' | 'cleared'
  clearedAt?: string
}

export interface PendingQr {
  id: string
  merchant: string
  customerName: string
  items: TransactionItem[]
  amount: number
  category: string
  status: 'waiting' | 'scanned' | 'confirmed'
  payBy: string
}

export interface SettlementNotice {
  id: string
  kind: 'settled' | 'auto'
  customerName: string
  merchant: string
  amount: number
  settledAt: string
  seen: boolean
}

export interface ShopkeeperRecent {
  id: string
  customerName: string
  amount: number
  status: VerificationStatus
}

export interface KhataState {
  customer: Customer
  merchant: Merchant
  wallet: Wallet
  settlement: Settlement
  transactions: Transaction[]
  pendingQr: PendingQr | null
  shopkeeperRecent: ShopkeeperRecent[]
  notices: SettlementNotice[]
  nextSequence: number
}

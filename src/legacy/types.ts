export type TransactionStatus = 'verified' | 'pending' | 'settled'

export type PaymentMode = 'qr' | 'quick-qr' | 'ocr-qr'

export interface Customer {
  id: string
  name: string
  phone: string
  currentBalance: number
  lastSettlementDate: string | null
  nextSettlementDate: string
}

export interface Item {
  name: string
  quantity: number
  price: number
  matchedProductId: string | null
  confidence: number
}

export interface Transaction {
  id: string
  customerId: string
  merchantName: string
  items: Item[]
  amount: number
  status: TransactionStatus
  paymentMode: PaymentMode
  referenceId: string
  timestamp: string
  voicePlayed: boolean
  settlementState: 'open' | 'settled'
  amountPaid?: number
  settledAt?: string
  settlementSource?: 'customer' | 'auto'
}

export interface BillDraft {
  uploadedImageUrl: string | null
  extractedText: string
  extractedItems: Item[]
  merchantName: string
  billDate: string
  subtotal: number
  tax: number
  totalAmount: number
  confidenceScore: number
  needsReview: boolean
}

export interface QuickQRDraft {
  amount: number
  customerId: string
  merchantName: string
  referenceId: string
  qrPayload: string
}

export interface Settlement {
  id: string
  customerId: string
  amount: number
  timestamp: string
  transactionIds: string[]
}

export interface Product {
  id: string
  name: string
  aliases: string[]
  unitPrice: number
}

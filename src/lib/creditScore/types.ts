export type SettlementSource = 'customer' | 'auto'
export type LedgerEventKind = 'payment' | 'dispute' | 'correction'
export type PaymentKind = 'partial' | 'full'
export type ScoreStatus = 'scored' | 'unscored'
export type ScoreBand = 'building' | 'reliable' | 'strong'
export type FeatureDirection = 'helps' | 'hurts' | 'neutral'

export interface LedgerEvent {
  id: string
  kind: LedgerEventKind
  customerName: string
  merchant: string
  timestamp: string
  source: SettlementSource | 'shopkeeper'
  transactionIds: string[]
  amount?: number
  paymentKind?: PaymentKind
  note?: string
  previousAmount?: number
  nextAmount?: number
}

export interface ScoreBill {
  id: string
  customerName: string
  merchant: string
  amount: number
  amountPaid: number
  postedAt: string
  payBy?: string
  settled: boolean
  settledAt?: string
  settlementSource?: SettlementSource
}

export interface ScoreFeature {
  key: string
  label: string
  value: number
  unit: string
  contribution: number
  direction: FeatureDirection
  explanation: string
}

export interface CreditScoreReport {
  version: string
  product: 'alternative_data'
  lending: {
    inScope: false
    note: string
  }
  subject: {
    customerName: string
    merchant: string
  }
  status: ScoreStatus
  unscoredReason?: 'insufficient_history'
  confirmedSettlements: number
  minConfirmedSettlements: number
  score: number | null
  band: ScoreBand | null
  features: ScoreFeature[]
  computedAt: string
}

export interface ScoreInput {
  customerName: string
  merchant: string
  bills: ScoreBill[]
  events: LedgerEvent[]
  now?: Date
}

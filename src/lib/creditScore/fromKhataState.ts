import { scoreKhataCredit } from './score'
import type { KhataState, Transaction } from '../../types'
import type { ScoreBill } from './types'

export function paidOnBill(tx: Pick<Transaction, 'amount' | 'amountPaid' | 'settled'>): number {
  if (typeof tx.amountPaid === 'number') return tx.amountPaid
  return tx.settled ? tx.amount : 0
}

export function remainingOnBill(tx: Pick<Transaction, 'amount' | 'amountPaid' | 'settled'>): number {
  return Math.max(0, tx.amount - paidOnBill(tx))
}

export function billsFromKhata(transactions: Transaction[]): ScoreBill[] {
  return transactions.map((tx) => ({
    id: tx.id,
    customerName: tx.customerName,
    merchant: tx.merchant,
    amount: tx.amount,
    amountPaid: paidOnBill(tx),
    postedAt: tx.timestamp,
    payBy: tx.payBy,
    settled: tx.settled,
    settledAt: tx.settledAt,
    settlementSource: tx.settlementSource,
  }))
}

export function scoreInputFromKhata(
  state: Pick<KhataState, 'transactions' | 'ledgerEvents'>,
  customerName: string,
  merchant: string,
) {
  return {
    customerName,
    merchant,
    bills: billsFromKhata(state.transactions),
    events: state.ledgerEvents ?? [],
  }
}

export function creditReportFor(
  state: Pick<KhataState, 'transactions' | 'ledgerEvents'>,
  customerName: string,
  merchant: string,
  now?: Date,
) {
  return scoreKhataCredit({ ...scoreInputFromKhata(state, customerName, merchant), now })
}

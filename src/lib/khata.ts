import type { Customer, Item, PaymentMode, Transaction } from '../types'
import { createReferenceId } from './format'

export interface AddToKhataInput {
  customer: Customer
  merchantName: string
  amount: number
  items: Item[]
  paymentMode: PaymentMode
  referenceId?: string
}

export function addToKhata(
  customers: Customer[],
  transactions: Transaction[],
  input: AddToKhataInput,
): { customers: Customer[]; transactions: Transaction[]; transaction: Transaction } {
  const customer = customers.find((entry) => entry.id === input.customer.id)
  if (!customer) {
    throw new Error('Customer not found. Select a customer by phone or ID.')
  }
  if (!input.customer.id || !input.customer.phone) {
    throw new Error('Transactions must be linked to customerId or verified phone.')
  }
  if (input.amount <= 0) {
    throw new Error('Amount must be greater than zero.')
  }

  const transaction: Transaction = {
    id: `tx-${crypto.randomUUID()}`,
    customerId: customer.id,
    merchantName: input.merchantName,
    items: input.items,
    amount: input.amount,
    status: 'verified',
    paymentMode: input.paymentMode,
    referenceId: input.referenceId ?? createReferenceId(),
    timestamp: new Date().toISOString(),
    voicePlayed: false,
    settlementState: 'open',
  }

  const nextCustomers = customers.map((entry) =>
    entry.id === customer.id
      ? { ...entry, currentBalance: entry.currentBalance + input.amount }
      : entry,
  )

  return {
    customers: nextCustomers,
    transactions: [transaction, ...transactions],
    transaction,
  }
}

export function settleCustomer(
  customers: Customer[],
  transactions: Transaction[],
  customerId: string,
): { customers: Customer[]; transactions: Transaction[]; settledAmount: number } {
  const open = transactions.filter(
    (tx) => tx.customerId === customerId && tx.settlementState === 'open',
  )
  const settledAmount = open.reduce((sum, tx) => sum + tx.amount, 0)

  const nextCustomers = customers.map((entry) =>
    entry.id === customerId
      ? {
          ...entry,
          currentBalance: 0,
          lastSettlementDate: new Date().toISOString(),
          nextSettlementDate: nextMonthIso(),
        }
      : entry,
  )

  const nextTransactions = transactions.map((tx) =>
    tx.customerId === customerId && tx.settlementState === 'open'
      ? { ...tx, settlementState: 'settled' as const, status: 'settled' as const }
      : tx,
  )

  return { customers: nextCustomers, transactions: nextTransactions, settledAmount }
}

function nextMonthIso(): string {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  date.setDate(30)
  return date.toISOString()
}

export function shopOutstanding(customers: Customer[]): number {
  return customers.reduce((sum, customer) => sum + customer.currentBalance, 0)
}

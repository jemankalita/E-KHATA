import type { Customer, Item, PaymentMode, Transaction } from '../legacy/types'
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
    throw new Error('Customer account not found. Select an account first.')
  }
  if (!input.customer.id) {
    throw new Error('Transactions must be linked to a customer account.')
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
    amountPaid: 0,
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
  options: { source?: 'customer' | 'auto'; at?: Date } = {},
): { customers: Customer[]; transactions: Transaction[]; settledAmount: number } {
  const at = (options.at ?? new Date()).toISOString()
  const source = options.source ?? 'customer'
  const open = transactions.filter(
    (tx) => tx.customerId === customerId && tx.settlementState === 'open',
  )
  const settledAmount = open.reduce((sum, tx) => sum + tx.amount - (tx.amountPaid ?? 0), 0)

  const nextCustomers = customers.map((entry) =>
    entry.id === customerId
      ? {
          ...entry,
          currentBalance: 0,
          lastSettlementDate: at,
          nextSettlementDate: nextMonthIso(),
        }
      : entry,
  )

  const nextTransactions = transactions.map((tx) =>
    tx.customerId === customerId && tx.settlementState === 'open'
      ? {
          ...tx,
          settlementState: 'settled' as const,
          status: 'settled' as const,
          amountPaid: tx.amount,
          settledAt: at,
          settlementSource: source,
        }
      : tx,
  )

  return { customers: nextCustomers, transactions: nextTransactions, settledAmount }
}

export function autoSettleDue(
  customers: Customer[],
  transactions: Transaction[],
  now: Date = new Date(),
): {
  customers: Customer[]
  transactions: Transaction[]
  settledCustomerIds: string[]
  settledAmount: number
} {
  const dueIds = customers
    .filter((customer) => new Date(customer.nextSettlementDate).getTime() <= now.getTime())
    .map((customer) => customer.id)

  return dueIds.reduce(
    (state, customerId) => {
      const next = settleCustomer(state.customers, state.transactions, customerId, {
        source: 'auto',
        at: now,
      })
      return {
        customers: next.customers,
        transactions: next.transactions,
        settledCustomerIds: [...state.settledCustomerIds, customerId],
        settledAmount: state.settledAmount + next.settledAmount,
      }
    },
    {
      customers,
      transactions,
      settledCustomerIds: [] as string[],
      settledAmount: 0,
    },
  )
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

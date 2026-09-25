import { remainingOnBill } from '@/lib/creditScore/fromKhataState'
import type { LedgerEvent } from '@/lib/creditScore/types'
import type { KhataState, Transaction } from '@/types'

function eventId(kind: string, at: Date) {
  return `${kind}-${at.toISOString()}`
}

function withLedgerEvent(prev: KhataState, event: LedgerEvent): KhataState {
  return { ...prev, ledgerEvents: [event, ...(prev.ledgerEvents ?? [])] }
}

function applyDelta(
  prev: KhataState,
  tx: Transaction,
  paidDelta: number,
): Pick<KhataState, 'wallet' | 'merchant'> {
  const walletDelta = tx.customerName === prev.customer.name ? paidDelta : 0
  const merchantDelta = tx.merchant === prev.merchant.name ? paidDelta : 0
  return {
    wallet: {
      ...prev.wallet,
      outstanding: Math.max(0, prev.wallet.outstanding - walletDelta),
    },
    merchant: {
      ...prev.merchant,
      outstanding: Math.max(0, prev.merchant.outstanding - merchantDelta),
    },
  }
}

export function applyCustomerPayment(
  prev: KhataState,
  customerName: string,
  merchant: string,
  amount: number,
  at: Date,
): KhataState {
  if (!Number.isFinite(amount) || amount <= 0) return prev
  const open = prev.transactions
    .filter((tx) => tx.customerName === customerName && tx.merchant === merchant && remainingOnBill(tx) > 0)
    .slice()
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  if (open.length === 0) return prev

  let leftover = amount
  const paidIds: string[] = []
  const nextRows = new Map<string, Transaction>()

  for (const tx of open) {
    if (leftover <= 0) break
    const due = remainingOnBill(tx)
    const take = Math.min(due, leftover)
    leftover -= take
    const amountPaid = (tx.amountPaid ?? 0) + take
    const settled = amountPaid >= tx.amount
    nextRows.set(tx.id, {
      ...tx,
      amountPaid,
      settled,
      settledAt: settled ? at.toISOString() : tx.settledAt,
      settlementSource: settled ? 'customer' : tx.settlementSource,
    })
    paidIds.push(tx.id)
  }

  const applied = amount - leftover
  if (applied <= 0) return prev

  let next: KhataState = {
    ...prev,
    transactions: prev.transactions.map((tx) => nextRows.get(tx.id) ?? tx),
  }
  for (const tx of open) {
    const updated = nextRows.get(tx.id)
    if (!updated) continue
    const delta = remainingOnBill(tx) - remainingOnBill(updated)
    if (delta > 0) {
      const money = applyDelta(next, tx, delta)
      next = { ...next, wallet: money.wallet, merchant: money.merchant }
    }
  }

  const remainingAfter = next.transactions
    .filter((tx) => tx.customerName === customerName && tx.merchant === merchant)
    .some((tx) => remainingOnBill(tx) > 0)

  if (!remainingAfter && customerName === prev.customer.name) {
    const stillOpen = next.transactions.some((tx) => remainingOnBill(tx) > 0)
    next = {
      ...next,
      settlement: stillOpen
        ? next.settlement
        : { ...next.settlement, status: 'cleared', clearedAt: at.toISOString() },
    }
  }

  next = {
    ...next,
    notices: [
      {
        id: `notice-${merchant}-${customerName}-${at.toISOString()}`,
        kind: 'settled',
        customerName,
        merchant,
        amount: applied,
        settledAt: at.toISOString(),
        seen: false,
      },
      ...next.notices,
    ],
  }

  return withLedgerEvent(next, {
    id: eventId('payment', at),
    kind: 'payment',
    customerName,
    merchant,
    timestamp: at.toISOString(),
    source: 'customer',
    transactionIds: paidIds,
    amount: applied,
    paymentKind: remainingAfter ? 'partial' : 'full',
  })
}

export function fileDispute(prev: KhataState, transactionId: string, note: string, at: Date): KhataState {
  const tx = prev.transactions.find((row) => row.id === transactionId)
  if (!tx) return prev
  const next = {
    ...prev,
    transactions: prev.transactions.map((row) => (row.id === transactionId ? { ...row, disputed: true } : row)),
  }
  return withLedgerEvent(next, {
    id: eventId('dispute', at),
    kind: 'dispute',
    customerName: tx.customerName,
    merchant: tx.merchant,
    timestamp: at.toISOString(),
    source: 'customer',
    transactionIds: [tx.id],
    note: note.trim() || 'Disputed bill',
  })
}

export function correctBillAmount(prev: KhataState, transactionId: string, nextAmount: number, at: Date): KhataState {
  const tx = prev.transactions.find((row) => row.id === transactionId)
  if (!tx || !Number.isFinite(nextAmount) || nextAmount <= 0) return prev
  const paid = tx.amountPaid ?? (tx.settled ? tx.amount : 0)
  const amount = Math.max(nextAmount, paid)
  const settled = paid >= amount
  const delta = tx.amount - amount
  let next: KhataState = {
    ...prev,
    transactions: prev.transactions.map((row) =>
      row.id === transactionId
        ? {
            ...row,
            amount,
            settled,
            settledAt: settled ? (row.settledAt ?? at.toISOString()) : row.settledAt,
            settlementSource: settled ? (row.settlementSource ?? 'customer') : row.settlementSource,
          }
        : row,
    ),
  }
  if (delta !== 0 && !tx.settled) {
    const money = applyDelta(next, tx, delta)
    next = { ...next, wallet: money.wallet, merchant: money.merchant }
  }
  return withLedgerEvent(next, {
    id: eventId('correction', at),
    kind: 'correction',
    customerName: tx.customerName,
    merchant: tx.merchant,
    timestamp: at.toISOString(),
    source: 'shopkeeper',
    transactionIds: [tx.id],
    previousAmount: tx.amount,
    nextAmount: amount,
  })
}

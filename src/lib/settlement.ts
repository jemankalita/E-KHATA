import { remainingOnBill } from '@/lib/creditScore/fromKhataState'
import { applyCustomerPayment } from '@/lib/ledgerOps'
import type { KhataState, SettlementNotice, Transaction } from '@/types'

function noticeId(merchant: string, customerName: string, at: Date): string {
  return `notice-${merchant}-${customerName}-${at.toISOString()}`
}

function groupOpen(
  prev: KhataState,
  merchant: string,
  customerName?: string,
) {
  return prev.transactions.filter(
    (tx) =>
      remainingOnBill(tx) > 0 &&
      tx.merchant === merchant &&
      (!customerName || tx.customerName === customerName),
  )
}

function withSettled(
  prev: KhataState,
  ids: Set<string>,
  notices: SettlementNotice[],
  at: Date,
  source: 'customer' | 'auto',
): KhataState {
  const settledRows = prev.transactions.filter((tx) => ids.has(tx.id))
  const walletDelta = settledRows
    .filter((tx) => tx.customerName === prev.customer.name)
    .reduce((sum, tx) => sum + remainingOnBill(tx), 0)
  const merchantDelta = settledRows
    .filter((tx) => tx.merchant === prev.merchant.name)
    .reduce((sum, tx) => sum + remainingOnBill(tx), 0)
  const transactions = prev.transactions.map((tx) =>
    ids.has(tx.id)
      ? {
          ...tx,
          settled: true,
          amountPaid: tx.amount,
          settledAt: at.toISOString(),
          settlementSource: source,
        }
      : tx,
  )
  const remainingOpen = transactions.some((tx) => remainingOnBill(tx) > 0)
  const events = settledRows.map((tx) => ({
    id: `payment-${source}-${tx.id}-${at.toISOString()}`,
    kind: 'payment' as const,
    customerName: tx.customerName,
    merchant: tx.merchant,
    timestamp: at.toISOString(),
    source,
    transactionIds: [tx.id],
    amount: remainingOnBill(tx),
    paymentKind: 'full' as const,
  }))
  return {
    ...prev,
    wallet: {
      ...prev.wallet,
      outstanding: Math.max(0, prev.wallet.outstanding - walletDelta),
    },
    merchant: {
      ...prev.merchant,
      outstanding: Math.max(0, prev.merchant.outstanding - merchantDelta),
    },
    transactions,
    settlement: remainingOpen
      ? prev.settlement
      : {
          ...prev.settlement,
          status: 'cleared',
          clearedAt: at.toISOString(),
        },
    notices: [...notices, ...prev.notices],
    ledgerEvents: [...events, ...(prev.ledgerEvents ?? [])],
  }
}

export function settleStoreBills(
  prev: KhataState,
  merchant: string,
  at: Date,
  customerName?: string,
): KhataState {
  if (customerName) {
    const due = groupOpen(prev, merchant, customerName).reduce((sum, tx) => sum + remainingOnBill(tx), 0)
    if (due <= 0) return prev
    return applyCustomerPayment(prev, customerName, merchant, due, at)
  }

  const openForStore = groupOpen(prev, merchant)
  if (openForStore.length === 0) return prev

  const byCustomer = new Map<string, number>()
  for (const tx of openForStore) {
    byCustomer.set(tx.customerName, (byCustomer.get(tx.customerName) ?? 0) + remainingOnBill(tx))
  }
  const notices: SettlementNotice[] = [...byCustomer.entries()].map(([name, amount]) => ({
    id: noticeId(merchant, name, at),
    kind: 'settled',
    customerName: name,
    merchant,
    amount,
    settledAt: at.toISOString(),
    seen: false,
  }))
  return withSettled(prev, new Set(openForStore.map((tx) => tx.id)), notices, at, 'customer')
}

export function settleKhataAll(prev: KhataState, at: Date): KhataState {
  const open = prev.transactions.filter((tx) => remainingOnBill(tx) > 0)
  if (open.length === 0) {
    return {
      ...prev,
      wallet: { ...prev.wallet, outstanding: 0, carriedForward: 0 },
      settlement: { ...prev.settlement, status: 'cleared', clearedAt: at.toISOString() },
    }
  }
  const byMerchant = new Map<string, { amount: number; names: Set<string> }>()
  for (const tx of open) {
    const current = byMerchant.get(tx.merchant) ?? { amount: 0, names: new Set<string>() }
    current.amount += remainingOnBill(tx)
    current.names.add(tx.customerName)
    byMerchant.set(tx.merchant, current)
  }
  const notices: SettlementNotice[] = [...byMerchant.entries()].map(([merchant, row]) => {
    const names = [...row.names]
    return {
      id: noticeId(merchant, names.join(','), at),
      kind: 'auto',
      customerName: names.length === 1 ? names[0]! : `${names.length} customers`,
      merchant,
      amount: row.amount,
      settledAt: at.toISOString(),
      seen: false,
    }
  })
  const next = withSettled(prev, new Set(open.map((tx) => tx.id)), notices, at, 'auto')
  return {
    ...next,
    wallet: { ...next.wallet, outstanding: 0, carriedForward: 0 },
  }
}

export function markNoticesSeen(prev: KhataState, ids: string[]): KhataState {
  if (ids.length === 0) return prev
  const lookup = new Set(ids)
  return {
    ...prev,
    notices: prev.notices.map((notice) => (lookup.has(notice.id) ? { ...notice, seen: true } : notice)),
  }
}

export function openTransaction(tx: Transaction) {
  return remainingOnBill(tx) > 0
}

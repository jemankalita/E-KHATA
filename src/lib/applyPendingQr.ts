import type { KhataState, PendingQr, Transaction } from '@/types'
import { payByFromPreset } from '@/lib/payBy'

function verified() {
  return {
    qrPayload: true,
    merchantIdentity: true,
    amount: true,
    transactionId: true,
    customerConfirmation: true,
  }
}

export function applyPendingQr(prev: KhataState, pending: PendingQr): KhataState {
  const existing = prev.transactions.find((tx) => tx.id === pending.id)
  if (existing) {
    return {
      ...prev,
      pendingQr: { ...pending, status: 'confirmed' },
    }
  }

  const tx: Transaction = {
    id: pending.id,
    merchant: pending.merchant,
    customerName: pending.customerName,
    category: pending.category,
    amount: pending.amount,
    items: pending.items,
    source: 'QR',
    status: 'verified',
    timestamp: new Date().toISOString(),
    verification: verified(),
        settled: false,
        payBy: pending.payBy || payByFromPreset('7d'),
        amountPaid: 0,
      }

  const isHomeMerchant = pending.merchant === prev.merchant.name

  return {
    ...prev,
    wallet: {
      ...prev.wallet,
      outstanding: prev.wallet.outstanding + pending.amount,
    },
    merchant: {
      ...prev.merchant,
      outstanding: isHomeMerchant
        ? prev.merchant.outstanding + pending.amount
        : prev.merchant.outstanding,
      pendingConfirmations: Math.max(0, prev.merchant.pendingConfirmations - 1),
    },
    nextSequence: prev.nextSequence + 1,
    transactions: [tx, ...prev.transactions],
    pendingQr: { ...pending, status: 'confirmed' },
    shopkeeperRecent: [
      {
        id: tx.id,
        customerName: tx.customerName,
        amount: tx.amount,
        status: 'verified',
      },
      ...prev.shopkeeperRecent.filter((row) => row.id !== tx.id),
    ],
  }
}

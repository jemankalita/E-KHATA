import { describe, expect, it } from 'vitest'
import { applyPendingQr } from './applyPendingQr'
import { buildKhataQrUrl, parseKhataQrValue } from './khataQr'
import { INITIAL_STATE } from '@/data/demo'
import type { PendingQr } from '@/types'

const pending: PendingQr = {
  id: 'EK-2026-000399',
  merchant: 'Sharma Stores',
  customerName: 'Rahul Sharma',
  items: [
    { name: 'Milk', quantity: 1, price: 32 },
    { name: 'Bread', quantity: 1, price: 45 },
  ],
  amount: 77,
    category: 'Groceries',
    status: 'waiting',
    payBy: '2026-09-14T18:00:00.000Z',
  }

describe('khata QR URLs', () => {
  it('encodes a phone-camera URL that round-trips the bill', () => {
    const url = buildKhataQrUrl('https://e-khata.example', pending)
    expect(url.startsWith('https://e-khata.example/pay?')).toBe(true)
    expect(parseKhataQrValue(url)).toEqual(pending)
  })

  it('reads the same bill from a scanned JSON fallback', () => {
    expect(
      parseKhataQrValue(
        JSON.stringify({
          v: 1,
          network: 'E-KHATA',
          id: pending.id,
          merchant: pending.merchant,
          customerName: pending.customerName,
          amount: pending.amount,
          category: pending.category,
          items: pending.items,
        }),
      ),
    ).toMatchObject({ id: pending.id, amount: 77, merchant: 'Sharma Stores' })
  })

  it('rejects junk', () => {
    expect(parseKhataQrValue('not-a-qr')).toBeNull()
  })
})

describe('applyPendingQr', () => {
  it('posts the scanned bill onto the shopkeeper account and customer khata', () => {
    const next = applyPendingQr(INITIAL_STATE, { ...pending, status: 'confirmed' })
    expect(next.transactions[0]?.id).toBe('EK-2026-000399')
    expect(next.merchant.outstanding).toBe(INITIAL_STATE.merchant.outstanding + 77)
    expect(next.wallet.outstanding).toBe(INITIAL_STATE.wallet.outstanding + 77)
    expect(next.shopkeeperRecent[0]).toMatchObject({
      id: 'EK-2026-000399',
      customerName: 'Rahul Sharma',
      amount: 77,
      status: 'verified',
    })
    expect(next.transactions[0]?.payBy).toBe(pending.payBy)
    expect(next.nextSequence).toBe(INITIAL_STATE.nextSequence + 1)
  })

  it('does not double-post the same transaction id', () => {
    const once = applyPendingQr(INITIAL_STATE, { ...pending, status: 'confirmed' })
    const twice = applyPendingQr(once, { ...pending, status: 'confirmed' })
    expect(twice.transactions.filter((tx) => tx.id === pending.id)).toHaveLength(1)
    expect(twice.merchant.outstanding).toBe(once.merchant.outstanding)
  })
})

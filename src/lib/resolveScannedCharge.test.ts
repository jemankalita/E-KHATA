import { describe, expect, it } from 'vitest'
import { buildKhataQrUrl } from './khataQr'
import { findProductInPackText, resolveScannedCharge } from './resolveScannedCharge'
import type { PendingQr } from '@/types'

const context = {
  nextId: 'EK-2026-000410',
  merchant: 'Sharma Stores',
  customerName: 'Rahul Sharma',
}

describe('findProductInPackText', () => {
  it('recognizes an Amul milk packet from noisy label text', () => {
    expect(findProductInPackText('AMUL TAAZA TONED MILK 500ml')?.id).toBe('milk')
  })

  it('recognizes Lays chips from pack branding', () => {
    expect(findProductInPackText("LAY'S MAGIC MASALA POTATO CHIPS")?.id).toBe('chips')
  })

  it('recognizes Maggi noodles from the packet', () => {
    expect(findProductInPackText('MAGGI 2-MINUTE NOODLES MASALA')?.id).toBe('maggi')
  })

  it('returns null when the pack is not in the catalog', () => {
    expect(findProductInPackText('unknown snack brand xyz')).toBeNull()
  })
})

describe('resolveScannedCharge', () => {
  it('reads a shop bill QR and keeps its billed amount', () => {
    const bill: PendingQr = {
      id: 'EK-2026-000399',
      merchant: 'Sharma Stores',
      customerName: 'Rahul Sharma',
      items: [{ name: 'Milk', quantity: 1, price: 32 }],
      amount: 32,
      category: 'Groceries',
      status: 'waiting',
      payBy: '2026-09-14T18:00:00.000Z',
    }
    const url = buildKhataQrUrl('https://e-khata.example', bill)
    expect(resolveScannedCharge(url, context)).toMatchObject({
      id: 'EK-2026-000399',
      amount: 32,
      merchant: 'Sharma Stores',
    })
  })

  it('posts the catalog price for a scanned Amul milk packet', () => {
    expect(resolveScannedCharge('AMUL TAAZA TONED MILK 500ml', context)).toMatchObject({
      id: 'EK-2026-000410',
      amount: 32,
      items: [{ name: 'Milk', quantity: 1, price: 32 }],
      category: 'Retail',
    })
  })

  it('posts ₹20 for a Lays pack and ₹14 for Maggi', () => {
    expect(resolveScannedCharge('lays chips', context)?.amount).toBe(20)
    expect(resolveScannedCharge('maggi noodles', context)?.amount).toBe(14)
  })

  it('does not charge the wallet for unknown pack text', () => {
    expect(resolveScannedCharge('not-a-product', context)).toBeNull()
    expect(resolveScannedCharge('', context)).toBeNull()
  })
})

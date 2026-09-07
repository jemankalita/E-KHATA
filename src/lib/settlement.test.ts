import { describe, expect, it } from 'vitest'
import { INITIAL_STATE } from '@/data/demo'
import { settleKhataAll, settleStoreBills } from './settlement'

describe('settleStoreBills', () => {
  it('clears that shop and records a settlement notice', () => {
    const next = settleStoreBills(
      INITIAL_STATE,
      'Sharma Stores',
      new Date('2026-09-07T12:00:00.000Z'),
      'Rahul Sharma',
    )
    expect(next.transactions.filter((tx) => tx.merchant === 'Sharma Stores' && tx.customerName === 'Rahul Sharma' && !tx.settled)).toHaveLength(0)
    expect(next.transactions.some((tx) => tx.merchant === 'Sharma Stores' && tx.customerName === 'Aman Verma' && !tx.settled)).toBe(true)
    expect(next.transactions.some((tx) => tx.merchant === 'Campus Canteen' && !tx.settled)).toBe(true)
    expect(next.notices[0]).toMatchObject({
      kind: 'settled',
      customerName: 'Rahul Sharma',
      merchant: 'Sharma Stores',
      amount: 386,
    })
    expect(next.wallet.outstanding).toBe(INITIAL_STATE.wallet.outstanding - 386)
  })

  it('does nothing when the shop is already clear', () => {
    const cleared = settleStoreBills(INITIAL_STATE, 'Unknown Mart', new Date())
    expect(cleared).toBe(INITIAL_STATE)
  })
})

describe('settleKhataAll', () => {
  it('clears every open bill and notifies once per store', () => {
    const next = settleKhataAll(INITIAL_STATE, new Date('2026-09-07T12:00:00.000Z'))
    expect(next.transactions.every((tx) => tx.settled)).toBe(true)
    expect(next.wallet.outstanding).toBe(0)
    expect(next.settlement.status).toBe('cleared')
    expect(next.notices.map((notice) => notice.merchant).sort()).toEqual(
      ['Bus Route 21G', 'Campus Canteen', 'Sharma Stores'].sort(),
    )
  })
})

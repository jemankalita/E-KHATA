import { describe, expect, it } from 'vitest'
import { INITIAL_STATE } from '@/data/demo'
import { openBalancesByCustomer, soonestPayBy } from './customerBalances'

describe('openBalancesByCustomer', () => {
  it('shows each customer how much they still owe this shop', () => {
    const rows = openBalancesByCustomer(INITIAL_STATE.transactions, INITIAL_STATE.merchant.name)
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ customerName: 'Rahul Sharma', amount: 386 }),
        expect.objectContaining({ customerName: 'Aman Verma', amount: 240 }),
        expect.objectContaining({ customerName: 'Priya Singh', amount: 520 }),
      ]),
    )
    expect(rows[0]?.amount).toBeGreaterThanOrEqual(rows[1]?.amount ?? 0)
  })

  it('ignores settled bills and other shops', () => {
    const rows = openBalancesByCustomer(
      [
        {
          ...INITIAL_STATE.transactions[0]!,
          customerName: 'Rahul Sharma',
          merchant: 'Sharma Stores',
          amount: 100,
          settled: true,
        },
        {
          ...INITIAL_STATE.transactions[0]!,
          customerName: 'Rahul Sharma',
          merchant: 'Campus Canteen',
          amount: 80,
          settled: false,
        },
        {
          ...INITIAL_STATE.transactions[0]!,
          customerName: 'Aman Verma',
          merchant: 'Sharma Stores',
          amount: 50,
          settled: false,
        },
      ],
      'Sharma Stores',
    )
    expect(rows).toEqual([{ customerName: 'Aman Verma', amount: 50, payBy: expect.any(String), entries: 1 }])
  })
})

describe('soonestPayBy', () => {
  it('returns the nearest unpaid deadline', () => {
    expect(
      soonestPayBy([
        { payBy: '2026-09-30T18:00:00.000Z', settled: false },
        { payBy: '2026-09-10T18:00:00.000Z', settled: false },
        { payBy: '2026-09-08T18:00:00.000Z', settled: true },
      ]),
    ).toBe('2026-09-10T18:00:00.000Z')
  })
})

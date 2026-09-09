import { describe, expect, it } from 'vitest'
import { INITIAL_STATE } from '@/data/demo'
import { LENDING_PHASE1_BOUNDARY, MIN_CONFIRMED_SETTLEMENTS, SCORE_MAX, SCORE_MIN } from './constants'
import { scoreInputFromKhata } from './fromKhataState'
import { scoreKhataCredit } from './score'
import type { LedgerEvent, ScoreBill } from './types'

function bill(input: Partial<ScoreBill> & Pick<ScoreBill, 'id' | 'amount' | 'postedAt'>): ScoreBill {
  const settled = input.settled ?? false
  return {
    customerName: 'Rahul Sharma',
    merchant: 'Sharma Stores',
    amountPaid: input.amountPaid ?? (settled ? input.amount : 0),
    settled,
    ...input,
  }
}

function payment(id: string, at: string, amount: number, kind: 'partial' | 'full', txIds: string[]): LedgerEvent {
  return {
    id,
    kind: 'payment',
    customerName: 'Rahul Sharma',
    merchant: 'Sharma Stores',
    timestamp: at,
    source: 'customer',
    amount,
    paymentKind: kind,
    transactionIds: txIds,
  }
}

const historyBills: ScoreBill[] = [
  bill({
    id: 'h1',
    amount: 400,
    postedAt: '2026-06-02T10:00:00.000Z',
    payBy: '2026-06-30T18:00:00.000Z',
    settled: true,
    settledAt: '2026-06-06T10:00:00.000Z',
    settlementSource: 'customer',
  }),
  bill({
    id: 'h2',
    amount: 350,
    postedAt: '2026-07-04T10:00:00.000Z',
    payBy: '2026-07-31T18:00:00.000Z',
    settled: true,
    settledAt: '2026-07-10T10:00:00.000Z',
    settlementSource: 'customer',
  }),
  bill({
    id: 'h3',
    amount: 280,
    postedAt: '2026-08-03T10:00:00.000Z',
    payBy: '2026-08-31T18:00:00.000Z',
    settled: true,
    settledAt: '2026-08-08T10:00:00.000Z',
    settlementSource: 'customer',
  }),
  bill({
    id: 'open',
    amount: 386,
    postedAt: '2026-09-06T08:14:00.000Z',
    payBy: '2026-09-30T18:00:00.000Z',
  }),
]

const historyPayments: LedgerEvent[] = [
  payment('p1', '2026-06-06T10:00:00.000Z', 400, 'full', ['h1']),
  payment('p2', '2026-07-10T10:00:00.000Z', 350, 'full', ['h2']),
  payment('p3', '2026-08-08T10:00:00.000Z', 280, 'full', ['h3']),
]

describe('scoreKhataCredit', () => {
  it('withholds a numeric score until three customer settlements exist', () => {
    const report = scoreKhataCredit({
      customerName: 'Rahul Sharma',
      merchant: 'Sharma Stores',
      bills: historyBills.slice(0, 2),
      events: historyPayments.slice(0, 2),
      now: new Date('2026-09-08T12:00:00.000Z'),
    })
    expect(report.status).toBe('unscored')
    expect(report.score).toBeNull()
    expect(report.band).toBeNull()
    expect(report.unscoredReason).toBe('insufficient_history')
    expect(report.confirmedSettlements).toBe(2)
    expect(report.minConfirmedSettlements).toBe(MIN_CONFIRMED_SETTLEMENTS)
    expect(report.lending).toEqual({ inScope: false, note: LENDING_PHASE1_BOUNDARY })
  })

  it('ignores auto-settlements when counting confirmed history', () => {
    const report = scoreKhataCredit({
      customerName: 'Rahul Sharma',
      merchant: 'Sharma Stores',
      bills: historyBills.map((row) => ({ ...row, settlementSource: 'auto' as const })),
      events: historyPayments.map((row) => ({ ...row, source: 'auto' as const })),
      now: new Date('2026-09-08T12:00:00.000Z'),
    })
    expect(report.status).toBe('unscored')
    expect(report.confirmedSettlements).toBe(0)
  })

  it('returns a 300–900 score plus named feature contributions after three confirmed settlements', () => {
    const report = scoreKhataCredit({
      customerName: 'Rahul Sharma',
      merchant: 'Sharma Stores',
      bills: historyBills,
      events: historyPayments,
      now: new Date('2026-09-08T12:00:00.000Z'),
    })
    expect(report.status).toBe('scored')
    expect(report.score).toBeGreaterThanOrEqual(SCORE_MIN)
    expect(report.score).toBeLessThanOrEqual(SCORE_MAX)
    expect(report.band).toMatch(/building|reliable|strong/)
    expect(report.features.map((row) => row.key)).toEqual(
      expect.arrayContaining([
        'confirmed_settlements',
        'days_to_settle',
        'on_time_rate',
        'full_repay_rate',
        'dispute_rate',
        'correction_rate',
        'bill_frequency',
        'amount_stability',
      ]),
    )
    expect(report.features.every((row) => typeof row.explanation === 'string' && row.explanation.length > 0)).toBe(
      true,
    )
  })

  it('scores one shop–customer pair and ignores other shops', () => {
    const report = scoreKhataCredit({
      customerName: 'Rahul Sharma',
      merchant: 'Sharma Stores',
      bills: [
        ...historyBills,
        bill({
          id: 'canteen',
          merchant: 'Campus Canteen',
          amount: 80,
          postedAt: '2026-09-03T13:40:00.000Z',
        }),
      ],
      events: [
        ...historyPayments,
        {
          id: 'd1',
          kind: 'dispute',
          customerName: 'Rahul Sharma',
          merchant: 'Campus Canteen',
          timestamp: '2026-09-03T14:00:00.000Z',
          source: 'customer',
          transactionIds: ['canteen'],
          note: 'Wrong thali',
        },
      ],
      now: new Date('2026-09-08T12:00:00.000Z'),
    })
    expect(report.subject).toEqual({ customerName: 'Rahul Sharma', merchant: 'Sharma Stores' })
    expect(report.features.find((row) => row.key === 'dispute_rate')?.value).toBe(0)
  })

  it('treats partial repayments as a weaker full-repay feature', () => {
    const full = scoreKhataCredit({
      customerName: 'Rahul Sharma',
      merchant: 'Sharma Stores',
      bills: historyBills,
      events: historyPayments,
      now: new Date('2026-09-08T12:00:00.000Z'),
    })
    const mixed = scoreKhataCredit({
      customerName: 'Rahul Sharma',
      merchant: 'Sharma Stores',
      bills: historyBills,
      events: [
        payment('p1', '2026-06-06T10:00:00.000Z', 200, 'partial', ['h1']),
        payment('p1b', '2026-06-07T10:00:00.000Z', 200, 'full', ['h1']),
        historyPayments[1]!,
        historyPayments[2]!,
      ],
      now: new Date('2026-09-08T12:00:00.000Z'),
    })
    const fullRate = full.features.find((row) => row.key === 'full_repay_rate')?.value
    const mixedRate = mixed.features.find((row) => row.key === 'full_repay_rate')?.value
    expect(fullRate).toBe(1)
    expect(mixedRate).toBeLessThan(1)
  })

  it('scores Rahul Sharma at Sharma Stores from the demo ledger', () => {
    const report = scoreKhataCredit({
      ...scoreInputFromKhata(INITIAL_STATE, 'Rahul Sharma', 'Sharma Stores'),
      now: new Date('2026-09-08T12:00:00.000Z'),
    })
    expect(report.status).toBe('scored')
    expect(report.score).toBeGreaterThanOrEqual(SCORE_MIN)
  })
})

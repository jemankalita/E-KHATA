import { describe, expect, it } from 'vitest'
import { INITIAL_STATE } from '@/data/demo'
import { applyCustomerPayment, correctBillAmount, fileDispute } from './ledgerOps'

describe('applyCustomerPayment', () => {
  it('applies FIFO partials and records a customer payment event', () => {
    const next = applyCustomerPayment(
      INITIAL_STATE,
      'Rahul Sharma',
      'Sharma Stores',
      100,
      new Date('2026-09-07T12:00:00.000Z'),
    )
    const open = next.transactions.find((tx) => tx.id === 'EK-2026-000378')
    expect(open?.settled).toBe(false)
    expect(open?.amountPaid).toBe(100)
    expect(next.wallet.outstanding).toBe(INITIAL_STATE.wallet.outstanding - 100)
    expect(next.ledgerEvents[0]).toMatchObject({
      kind: 'payment',
      paymentKind: 'partial',
      source: 'customer',
      amount: 100,
      merchant: 'Sharma Stores',
    })
  })

  it('marks a bill settled when the remaining due is paid', () => {
    const next = applyCustomerPayment(
      INITIAL_STATE,
      'Rahul Sharma',
      'Sharma Stores',
      386,
      new Date('2026-09-07T12:00:00.000Z'),
    )
    const row = next.transactions.find((tx) => tx.id === 'EK-2026-000378')
    expect(row?.settled).toBe(true)
    expect(row?.settlementSource).toBe('customer')
    expect(next.ledgerEvents[0]?.paymentKind).toBe('full')
  })
})

describe('fileDispute and correctBillAmount', () => {
  it('records a dispute against a bill', () => {
    const next = fileDispute(INITIAL_STATE, 'EK-2026-000378', 'Wrong milk price', new Date('2026-09-07T12:00:00.000Z'))
    expect(next.transactions.find((tx) => tx.id === 'EK-2026-000378')?.disputed).toBe(true)
    expect(next.ledgerEvents[0]).toMatchObject({ kind: 'dispute', note: 'Wrong milk price' })
  })

  it('corrects an open bill amount and keeps paid-so-far', () => {
    const partial = applyCustomerPayment(
      INITIAL_STATE,
      'Rahul Sharma',
      'Sharma Stores',
      50,
      new Date('2026-09-07T12:00:00.000Z'),
    )
    const next = correctBillAmount(partial, 'EK-2026-000378', 300, new Date('2026-09-07T13:00:00.000Z'))
    const row = next.transactions.find((tx) => tx.id === 'EK-2026-000378')
    expect(row?.amount).toBe(300)
    expect(row?.amountPaid).toBe(50)
    expect(row?.settled).toBe(false)
    expect(next.ledgerEvents[0]).toMatchObject({ kind: 'correction', previousAmount: 386, nextAmount: 300 })
  })
})

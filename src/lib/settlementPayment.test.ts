import { describe, expect, it } from 'vitest'
import { buildSettlementPayment } from './settlementPayment'

describe('buildSettlementPayment', () => {
  it('converts rupees to paise for Razorpay checkout', () => {
    expect(
      buildSettlementPayment({
        merchant: 'Sharma Stores',
        customerName: 'Rahul Sharma',
        amountInr: 386,
      }),
    ).toEqual({
      merchant: 'Sharma Stores',
      customerName: 'Rahul Sharma',
      amountInr: 386,
      amountPaise: 38600,
      currency: 'INR',
      description: 'Settle Sharma Stores on E-Khata',
      notes: { merchant: 'Sharma Stores', purpose: 'khata-settlement' },
    })
  })

  it('rejects zero and negative amounts', () => {
    expect(() =>
      buildSettlementPayment({ merchant: 'Shop', customerName: 'Rahul', amountInr: 0 }),
    ).toThrow(/positive/i)
    expect(() =>
      buildSettlementPayment({ merchant: 'Shop', customerName: 'Rahul', amountInr: -20 }),
    ).toThrow(/positive/i)
  })
})

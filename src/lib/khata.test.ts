import { describe, expect, it } from 'vitest'
import { CUSTOMERS, TRANSACTIONS } from '../data/seed'
import { addToKhata, autoSettleDue, settleCustomer } from './khata'

describe('khata', () => {
  it('rejects transactions without a known customer id', () => {
    expect(() =>
      addToKhata(CUSTOMERS, TRANSACTIONS, {
        customer: { ...CUSTOMERS[0]!, id: 'missing' },
        merchantName: 'Kalita Kirana',
        amount: 90,
        items: [],
        paymentMode: 'quick-qr',
      }),
    ).toThrow(/Customer account not found/)
  })

  it('posts to an account without requiring a phone number', () => {
    const customer = { ...CUSTOMERS[0]!, phone: '' }
    const result = addToKhata(
      CUSTOMERS.map((entry) => (entry.id === customer.id ? customer : entry)),
      TRANSACTIONS,
      {
        customer,
        merchantName: 'Kalita Kirana',
        amount: 40,
        items: [],
        paymentMode: 'quick-qr',
      },
    )
    expect(result.transaction.customerId).toBe(customer.id)
    expect(result.customers.find((entry) => entry.id === customer.id)?.currentBalance).toBe(
      customer.currentBalance + 40,
    )
  })

  it('auto-settles accounts whose due date has passed', () => {
    const customers = [{ ...CUSTOMERS[0]!, nextSettlementDate: '2026-08-01T00:00:00.000Z' }]
    const result = autoSettleDue(customers, TRANSACTIONS, new Date('2026-09-06T12:00:00.000Z'))
    expect(result.settledCustomerIds).toEqual(['cust-aarav'])
    expect(result.customers[0]?.currentBalance).toBe(0)
    expect(result.transactions.every((tx) => tx.customerId !== 'cust-aarav' || tx.settlementState === 'settled')).toBe(
      true,
    )
  })

  it('leaves accounts that are not yet due', () => {
    const result = autoSettleDue(CUSTOMERS, TRANSACTIONS, new Date('2026-09-06T12:00:00.000Z'))
    expect(result.settledCustomerIds).toEqual([])
    expect(result.customers[0]?.currentBalance).toBe(CUSTOMERS[0]!.currentBalance)
  })

  it('adds amount to the selected customer balance and prepends a verified ledger row', () => {
    const customer = CUSTOMERS[0]!
    const result = addToKhata(CUSTOMERS, TRANSACTIONS, {
      customer,
      merchantName: 'Kalita Kirana',
      amount: 90,
      items: [{ name: 'Maggi', quantity: 2, price: 28, matchedProductId: 'maggi', confidence: 0.95 }],
      paymentMode: 'ocr-qr',
      referenceId: 'EKH-1209',
    })

    const updated = result.customers.find((entry) => entry.id === customer.id)
    expect(updated?.currentBalance).toBe(customer.currentBalance + 90)
    expect(result.transaction.status).toBe('verified')
    expect(result.transaction.customerId).toBe(customer.id)
    expect(result.transactions[0]?.referenceId).toBe('EKH-1209')
    expect(CUSTOMERS[0]?.currentBalance).toBe(1240)
  })

  it('settles open transactions and zeros the customer balance', () => {
    const result = settleCustomer(CUSTOMERS, TRANSACTIONS, 'cust-aarav')
    const customer = result.customers.find((entry) => entry.id === 'cust-aarav')
    expect(customer?.currentBalance).toBe(0)
    expect(result.transactions.every((tx) => tx.customerId !== 'cust-aarav' || tx.status === 'settled')).toBe(true)
    expect(result.settledAmount).toBe(205)
  })
})

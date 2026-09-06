import { describe, expect, it } from 'vitest'
import { buildPayUrl, parsePaySearch } from './payLink'

describe('pay links', () => {
  it('encodes a web URL a phone camera can open', () => {
    const url = buildPayUrl({
      origin: 'http://192.168.1.10:5173',
      referenceId: 'EKH-1209',
      customerId: 'cust-aarav',
      amount: 120,
      merchantName: 'Kalita Kirana',
      paymentMode: 'quick-qr',
    })
    expect(url).toContain('http://192.168.1.10:5173/pay?')
    const parsed = parsePaySearch(new URL(url).searchParams)
    expect(parsed).toEqual({
      ref: 'EKH-1209',
      amount: 120,
      customerId: 'cust-aarav',
      merchant: 'Kalita Kirana',
      mode: 'quick-qr',
    })
  })

  it('rejects a QR without customer identity', () => {
    const params = new URLSearchParams('ref=EKH-1&amount=20')
    expect(parsePaySearch(params)).toBeNull()
  })
})

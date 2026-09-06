import { describe, expect, it } from 'vitest'
import { parseQrPayload } from './format'
import { buildPayUrl } from './payLink'

describe('qr payload', () => {
  it('still understands legacy ekhata:// payloads', () => {
    expect(parseQrPayload('ekhata://pay?ref=EKH-1209&amount=120')).toEqual({
      ref: 'EKH-1209',
      amount: 120,
    })
  })

  it('uses http pay links for new QRs', () => {
    expect(
      buildPayUrl({
        origin: 'http://localhost:5173',
        referenceId: 'EKH-1209',
        customerId: 'cust-aarav',
        amount: 120,
        merchantName: 'Kalita Kirana',
        paymentMode: 'qr',
      }),
    ).toBe('http://localhost:5173/pay?ref=EKH-1209&amount=120&customerId=cust-aarav&merchant=Kalita+Kirana&mode=qr')
  })
})

import { describe, expect, it } from 'vitest'
import { isExternalPaymentUrl } from './paymentLaunch'

describe('isExternalPaymentUrl', () => {
  it('treats UPI and wallet schemes as external checkout launches', () => {
    expect(isExternalPaymentUrl('upi://pay?pa=shop@upi&am=10.00')).toBe(true)
    expect(isExternalPaymentUrl('tez://upi/pay?pa=shop@upi')).toBe(true)
    expect(isExternalPaymentUrl('gpay://upi/pay?pa=shop@upi')).toBe(true)
    expect(isExternalPaymentUrl('phonepe://pay?pa=shop@upi')).toBe(true)
    expect(isExternalPaymentUrl('paytmmp://pay?pa=shop@upi')).toBe(true)
    expect(isExternalPaymentUrl('bhim://upi/pay?pa=shop@upi')).toBe(true)
    expect(isExternalPaymentUrl('intent://pay#Intent;scheme=upi;end')).toBe(true)
  })

  it('leaves https checkout pages in the WebView', () => {
    expect(isExternalPaymentUrl('https://checkout.razorpay.com/v1/checkout.js')).toBe(false)
    expect(isExternalPaymentUrl('https://cetowfbuumebmawpcucb.supabase.co/rest/v1/khata_states')).toBe(
      false,
    )
  })
})

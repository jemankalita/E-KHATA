const PAYMENT_SCHEMES = new Set(['upi', 'tez', 'gpay', 'phonepe', 'paytmmp', 'bhim', 'intent'])

export function isExternalPaymentUrl(href: string): boolean {
  try {
    const url = new URL(href)
    return PAYMENT_SCHEMES.has(url.protocol.replace(':', '').toLowerCase())
  } catch {
    return /^(upi|tez|gpay|phonepe|paytmmp|bhim|intent):/i.test(href)
  }
}

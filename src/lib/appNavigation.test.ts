import { describe, expect, it } from 'vitest'
import { HOSTED_WEB_ORIGIN, inAppPathFromUrl, rewriteHostedAppUrl } from './appNavigation'

describe('inAppPathFromUrl', () => {
  it('maps the Capacitor callback back into the app', () => {
    expect(inAppPathFromUrl('https://localhost/auth/callback?code=abc')).toBe(
      '/auth/callback?code=abc',
    )
  })

  it('maps the hosted website callback back into the app instead of staying on the web', () => {
    expect(inAppPathFromUrl(`${HOSTED_WEB_ORIGIN}/auth/callback?code=abc`)).toBe(
      '/auth/callback?code=abc',
    )
  })

  it('maps hosted app pages back to the same local route', () => {
    expect(inAppPathFromUrl(`${HOSTED_WEB_ORIGIN}/customer/settlement`)).toBe('/customer/settlement')
  })

  it('ignores payment and unrelated https urls', () => {
    expect(inAppPathFromUrl('https://checkout.razorpay.com/v1/checkout.js')).toBeNull()
    expect(inAppPathFromUrl('https://accounts.google.com/o/oauth2/v2/auth')).toBeNull()
  })
})

describe('rewriteHostedAppUrl', () => {
  it('rewrites the live site to the Capacitor origin so the WebView never becomes the website', () => {
    expect(rewriteHostedAppUrl(`${HOSTED_WEB_ORIGIN}/shopkeeper/qr?id=1`)).toBe(
      'https://localhost/shopkeeper/qr?id=1',
    )
  })

  it('does not rewrite API calls that must stay on the hosted origin', () => {
    expect(rewriteHostedAppUrl(`${HOSTED_WEB_ORIGIN}/api/voice`)).toBeNull()
  })
})

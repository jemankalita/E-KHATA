import { describe, expect, it } from 'vitest'
import { grainVisibleOnPath } from './grainVisibility'

describe('grainVisibleOnPath', () => {
  it('keeps grain on landing and account pages', () => {
    expect(grainVisibleOnPath('/login')).toBe(true)
    expect(grainVisibleOnPath('/customer')).toBe(true)
    expect(grainVisibleOnPath('/shopkeeper')).toBe(true)
  })

  it('hides grain on the QR scan camera', () => {
    expect(grainVisibleOnPath('/customer/scan')).toBe(false)
    expect(grainVisibleOnPath('/customer/scan?mode=qr')).toBe(false)
  })
})

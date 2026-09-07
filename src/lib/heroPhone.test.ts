import { describe, expect, it } from 'vitest'
import { HERO_PHONE_LEDGER, heroPhoneAriaLabel } from './heroPhone'

describe('heroPhone ledger snapshot', () => {
  it('describes the live khata shown inside the phone', () => {
    expect(heroPhoneAriaLabel()).toMatch(/e-khata on a phone/i)
    expect(HERO_PHONE_LEDGER.outstanding).toBeGreaterThan(0)
    expect(HERO_PHONE_LEDGER.openBills.map((bill) => bill.merchant)).toEqual([
      'Sharma Stores',
      'Campus Canteen',
      'Green Mart',
    ])
  })
})

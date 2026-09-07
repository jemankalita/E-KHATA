import { describe, expect, it, vi } from 'vitest'
import { DEMO_RFID_UID, createRfidWedgeReader, recognizeRfid } from './rfid'

describe('recognizeRfid', () => {
  it('maps the demo bus card to a verified fare', () => {
    const tap = recognizeRfid('ek-rfid-21g')
    expect(tap).toMatchObject({
      uid: DEMO_RFID_UID,
      merchant: 'Bus Route 21G',
      amount: 25,
      category: 'RFID Transaction',
    })
  })

  it('accepts hex serials from a USB or NFC reader', () => {
    const tap = recognizeRfid('04:A3:B2:C1:D5:80')
    expect(tap?.merchant).toBe('Bus Route 21G')
    expect(tap?.amount).toBe(25)
  })

  it('rejects unknown cards so stray typing does not post a fare', () => {
    expect(recognizeRfid('hello')).toBeNull()
    expect(recognizeRfid('')).toBeNull()
  })
})

describe('createRfidWedgeReader', () => {
  it('recognizes a burst UID followed by Enter as an automatic tap', () => {
    const onRead = vi.fn()
    const reader = createRfidWedgeReader({ onRead, maxIdleMs: 80 })
    const started = 1_000
    for (const [index, key] of DEMO_RFID_UID.split('').entries()) {
      reader.push(key, started + index)
    }
    reader.push('Enter', started + DEMO_RFID_UID.length)
    expect(onRead).toHaveBeenCalledWith(DEMO_RFID_UID)
  })

  it('drops a slow human-typed buffer instead of treating it as a card', () => {
    const onRead = vi.fn()
    const reader = createRfidWedgeReader({ onRead, maxIdleMs: 80 })
    reader.push('E', 0)
    reader.push('K', 200)
    reader.push('Enter', 400)
    expect(onRead).not.toHaveBeenCalled()
  })
})

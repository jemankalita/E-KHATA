import { CANTEEN_FARE, METRO_FARE, RFID_FARE } from '@/data/demo'

export const DEMO_RFID_UID = 'EKRFID21G'
export const METRO_RFID_UID = 'EKRFIDMETRO'
export const CANTEEN_RFID_UID = 'EKRFIDCANTEEN'

export const BUS_FARE_AMOUNT = RFID_FARE
export const METRO_FARE_AMOUNT = METRO_FARE
export const CANTEEN_FARE_AMOUNT = CANTEEN_FARE

export interface RfidTap {
  uid: string
  merchant: string
  amount: number
  category: string
}

const BUS_FARE: Omit<RfidTap, 'uid'> = {
  merchant: 'Bus Route 21G',
  amount: BUS_FARE_AMOUNT,
  category: 'RFID Transaction',
}

const METRO_TAP: Omit<RfidTap, 'uid'> = {
  merchant: 'City Metro',
  amount: METRO_FARE_AMOUNT,
  category: 'RFID Transaction',
}

const CANTEEN_TAP: Omit<RfidTap, 'uid'> = {
  merchant: 'Campus Canteen',
  amount: CANTEEN_FARE_AMOUNT,
  category: 'RFID Transaction',
}

const KNOWN_CARDS: Record<string, Omit<RfidTap, 'uid'>> = {
  EKRFID21G: BUS_FARE,
  EKR21G0001: BUS_FARE,
  '04A3B2C1D580': BUS_FARE,
  EKRFIDMETRO: METRO_TAP,
  EKMETRO50: METRO_TAP,
  EKRFIDCANTEEN: CANTEEN_TAP,
  EKCANTEEN100: CANTEEN_TAP,
}

export function normalizeRfidUid(raw: string): string {
  return raw.replace(/[\s:\-_]/g, '').toUpperCase()
}

function fareFromBarcode(uid: string): Omit<RfidTap, 'uid'> | null {
  if (uid.includes('CANTEEN')) return CANTEEN_TAP
  if (uid.includes('METRO')) return METRO_TAP
  if (uid.includes('BUS') || uid.includes('21G')) return BUS_FARE
  return null
}

export function recognizeRfid(raw: string): RfidTap | null {
  const uid = normalizeRfidUid(raw)
  if (!uid) return null
  const fare = KNOWN_CARDS[uid] ?? fareFromBarcode(uid)
  if (!fare) return null
  return { uid, ...fare }
}

export function createRfidWedgeReader(options: {
  onRead: (uid: string) => void
  maxIdleMs?: number
}) {
  const maxIdleMs = options.maxIdleMs ?? 80
  let buffer = ''
  let lastAt = 0

  return {
    push(key: string, now = Date.now()) {
      if (lastAt > 0 && now - lastAt > maxIdleMs) {
        buffer = ''
      }
      lastAt = now
      if (key === 'Enter') {
        const uid = normalizeRfidUid(buffer)
        buffer = ''
        if (uid.length >= 6 || fareFromBarcode(uid)) options.onRead(uid)
        return
      }
      if (key.length === 1 && /[a-zA-Z0-9:\-_]/.test(key)) {
        buffer += key
      }
    },
  }
}

export async function startWebNfcScan(onUid: (uid: string) => void): Promise<() => void> {
  const Reader = typeof window !== 'undefined' ? window.NDEFReader : undefined
  if (!Reader) return () => {}

  const abort = new AbortController()
  const reader = new Reader()
  const onReading = (event: NDEFReadingEvent) => {
    if (event.serialNumber) onUid(event.serialNumber)
  }
  reader.addEventListener('reading', onReading)

  const stop = () => {
    reader.removeEventListener('reading', onReading)
    abort.abort()
  }

  try {
    await reader.scan({ signal: abort.signal })
  } catch {
    stop()
    return () => {}
  }

  return stop
}

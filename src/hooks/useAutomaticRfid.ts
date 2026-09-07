import { createRfidWedgeReader, recognizeRfid, startWebNfcScan, type RfidTap } from '@/lib/rfid'
import { useEffect, useRef } from 'react'

const TAP_COOLDOWN_MS = 2000

export function useAutomaticRfid(onTap: (tap: RfidTap) => void) {
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap

  useEffect(() => {
    let lastUid = ''
    let lastAt = 0

    const emit = (raw: string) => {
      const tap = recognizeRfid(raw)
      if (!tap) return
      const now = Date.now()
      if (tap.uid === lastUid && now - lastAt < TAP_COOLDOWN_MS) return
      lastUid = tap.uid
      lastAt = now
      onTapRef.current(tap)
    }

    const wedge = createRfidWedgeReader({ onRead: emit })
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      if (target instanceof HTMLElement && target.isContentEditable) return
      wedge.push(event.key)
    }

    window.addEventListener('keydown', onKeyDown)
    let cleanedUp = false
    let stopNfc = () => {}
    void startWebNfcScan(emit).then((stop) => {
      if (cleanedUp) {
        stop()
        return
      }
      stopNfc = stop
    })

    return () => {
      cleanedUp = true
      window.removeEventListener('keydown', onKeyDown)
      stopNfc()
    }
  }, [])
}

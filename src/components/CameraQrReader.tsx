import { decodeQrFromFile, decodeQrFromVideoFrame } from '@/lib/decodeQr'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'

interface CameraQrReaderProps {
  onRead: (value: string) => void
}

type BarcodeDetectorCtor = new (options: { formats: string[] }) => {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>
}

function getBarcodeDetector(): BarcodeDetectorCtor | undefined {
  return (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
}

export function CameraQrReader({ onRead }: CameraQrReaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onReadRef = useRef(onRead)
  onReadRef.current = onRead
  const [notice, setNotice] = useState<{ text: string; tone: 'status' | 'alert' } | null>(null)
  const [busy, setBusy] = useState(false)
  const suppressCameraHintRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setNotice({
        text: 'Use Upload QR photo if this browser cannot open the camera.',
        tone: 'status',
      })
      return
    }

    let stream: MediaStream | null = null
    let timer = 0
    let stopped = false

    const Detector = getBarcodeDetector()

    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then(async (next) => {
        stream = next
        if (stopped) {
          next.getTracks().forEach((track) => track.stop())
          return
        }
        video.srcObject = next
        video.setAttribute('playsinline', 'true')
        video.setAttribute('webkit-playsinline', 'true')
        await video.play()
        const detector = Detector ? new Detector({ formats: ['qr_code'] }) : null
        const tick = async () => {
          if (stopped) return
          if (video.readyState < 2) {
            timer = window.setTimeout(() => void tick(), 240)
            return
          }
          try {
            if (detector) {
              const codes = await detector.detect(video)
              if (stopped) return
              const value = codes[0]?.rawValue
              if (value) {
                onReadRef.current(value)
                return
              }
            }
            const fromPixels = decodeQrFromVideoFrame(video)
            if (fromPixels) {
              onReadRef.current(fromPixels)
              return
            }
          } catch {
            /* keep scanning */
          }
          timer = window.setTimeout(() => void tick(), 240)
        }
        void tick()
      })
      .catch(() => {
        if (stopped || suppressCameraHintRef.current) return
        setNotice({
          text: 'Allow camera access, or upload a photo of the shop QR.',
          tone: 'status',
        })
      })

    return () => {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    suppressCameraHintRef.current = true
    if (!file.type.startsWith('image/') && file.type !== '') {
      setNotice({ text: 'Choose a photo of the shop QR.', tone: 'alert' })
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      const value = await decodeQrFromFile(file)
      if (value) {
        onReadRef.current(value)
        return
      }
      setNotice({ text: 'No readable QR in that photo. Try a closer, sharper shot.', tone: 'alert' })
    } catch {
      setNotice({ text: 'Could not read that photo. Try another image of the shop QR.', tone: 'alert' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] bg-card">
      <video
        ref={videoRef}
        className="aspect-square w-full bg-black object-cover"
        playsInline
        muted
        autoPlay
        aria-hidden="true"
      />
      <p
        role={notice?.tone === 'alert' ? 'alert' : 'status'}
        aria-live={notice?.tone === 'alert' ? 'assertive' : 'polite'}
        aria-atomic="true"
        className="min-h-[1.25rem] px-4 py-3 text-sm text-muted-foreground"
      >
        {notice?.text ?? ''}
      </p>
      <label className="relative mx-4 mb-4 mt-3 block rounded-full focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <input
          type="file"
          accept="image/*"
          aria-label={busy ? 'Reading QR' : 'Upload QR photo'}
          disabled={busy}
          className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-wait"
          onChange={(event) => void onPhoto(event)}
        />
        <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
          {busy ? 'Reading QR…' : 'Upload QR photo'}
        </span>
      </label>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

interface CameraQrReaderProps {
  onRead: (value: string) => void
}

export function CameraQrReader({ onRead }: CameraQrReaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot open the camera.')
      return
    }

    let stream: MediaStream | null = null
    let timer = 0
    let stopped = false

    const Detector = (
      window as Window & {
        BarcodeDetector?: new (options: { formats: string[] }) => {
          detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>
        }
      }
    ).BarcodeDetector

    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then(async (next) => {
        stream = next
        video.srcObject = next
        await video.play()
        if (!Detector) {
          setError('Use your phone Camera app on the shop QR, or upload a photo.')
          return
        }
        const detector = new Detector({ formats: ['qr_code'] })
        const tick = async () => {
          if (stopped || video.readyState < 2) {
            timer = window.setTimeout(() => void tick(), 240)
            return
          }
          try {
            const codes = await detector.detect(video)
            const value = codes[0]?.rawValue
            if (value) {
              onRead(value)
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
        setError('Allow camera access, or open the shop QR with your phone Camera app.')
      })

    return () => {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [onRead])

  return (
    <div className="overflow-hidden rounded-[28px] bg-card">
      <video ref={videoRef} className="aspect-square w-full bg-black object-cover" playsInline muted />
      {error ? <p className="px-4 py-3 text-sm text-muted-foreground">{error}</p> : null}
      <label className="block px-4 pb-4">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const Detector = (
              window as Window & {
                BarcodeDetector?: new (options: { formats: string[] }) => {
                  detect: (source: ImageBitmap) => Promise<Array<{ rawValue?: string }>>
                }
              }
            ).BarcodeDetector
            if (!Detector) {
              setError('This phone cannot read a photo QR here. Use the Camera app on the shop screen.')
              return
            }
            const bitmap = await createImageBitmap(file)
            const codes = await new Detector({ formats: ['qr_code'] }).detect(bitmap)
            if (codes[0]?.rawValue) onRead(codes[0].rawValue)
          }}
        />
        <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
          Upload or snap a QR photo
        </span>
      </label>
    </div>
  )
}

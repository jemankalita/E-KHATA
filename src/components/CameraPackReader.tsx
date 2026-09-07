import { readPackText } from '@/lib/recognizePack'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'

interface CameraPackReaderProps {
  onRead: (value: string) => void
}

export function CameraPackReader({ onRead }: CameraPackReaderProps) {
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
        text: 'Use Upload pack photo if this browser cannot open the camera.',
        tone: 'status',
      })
      return
    }

    let stream: MediaStream | null = null
    let stopped = false

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
      })
      .catch(() => {
        if (stopped || suppressCameraHintRef.current) return
        setNotice({
          text: 'Allow camera access, or upload a photo of the packet.',
          tone: 'status',
        })
      })

    return () => {
      stopped = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function emitFromImage(source: string) {
    const text = await readPackText(source)
    if (text) {
      onReadRef.current(text)
      return
    }
    setNotice({ text: 'Could not read a product name on that pack. Try a closer shot.', tone: 'alert' })
  }

  async function captureFrame() {
    const video = videoRef.current
    if (!video || video.readyState < 2) {
      setNotice({ text: 'Wait for the camera, then scan the pack.', tone: 'alert' })
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 640
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setNotice({ text: 'Could not capture that frame. Upload a pack photo instead.', tone: 'alert' })
      return
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setBusy(true)
    setNotice(null)
    try {
      await emitFromImage(dataUrl)
    } finally {
      setBusy(false)
    }
  }

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    suppressCameraHintRef.current = true
    if (!file.type.startsWith('image/') && file.type !== '') {
      setNotice({ text: 'Choose a photo of the packet.', tone: 'alert' })
      return
    }
    setBusy(true)
    setNotice(null)
    const url = URL.createObjectURL(file)
    try {
      await emitFromImage(url)
    } catch {
      setNotice({ text: 'Could not read that photo. Try another pack image.', tone: 'alert' })
    } finally {
      URL.revokeObjectURL(url)
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
      <div className="mx-4 mb-4 grid gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void captureFrame()}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? 'Reading pack…' : 'Scan this pack'}
        </button>
        <label className="relative block rounded-full focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <input
            type="file"
            accept="image/*"
            aria-label={busy ? 'Reading pack' : 'Upload pack photo'}
            disabled={busy}
            className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-wait"
            onChange={(event) => void onPhoto(event)}
          />
          <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
            {busy ? 'Reading pack…' : 'Upload pack photo'}
          </span>
        </label>
      </div>
    </div>
  )
}

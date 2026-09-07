import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { formatInr } from '@/lib/utils'
import { Camera, ImagePlus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_BYTES = 8 * 1024 * 1024

export function validateBillImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'That file is not an image. Use a photo of the bill.'
  if (file.size > MAX_BYTES) return 'That photo is over 8 MB. Try a smaller or lower-resolution shot.'
  return null
}

export function ShopkeeperUploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const { ocrDraft, ocrBusy, runOcr } = useKhata()

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    }
  }, [])

  async function onFile(file: File) {
    const problem = validateBillImage(file)
    if (problem) {
      setFileError(problem)
      return
    }
    setFileError(null)
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = URL.createObjectURL(file)
    await runOcr(objectUrl.current)
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void onFile(file)
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void onFile(file)
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-[13px] text-accent">Capture</p>
        <h1 className="mt-2 font-display text-5xl leading-[1.05] text-foreground">Scan the bill</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Photograph a printed kirana bill. We read the lines, match them to the shop catalog, then you review
          before posting to the khata.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={ocrBusy}
          aria-describedby="upload-hint"
          className={`mt-8 flex w-full flex-col items-center gap-3 rounded-[28px] border border-dashed px-4 py-12 text-center transition-colors disabled:opacity-60 ${
            dragging ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          {ocrBusy ? (
            <Sparkles size={24} aria-hidden="true" className="text-primary" />
          ) : (
            <ImagePlus size={24} aria-hidden="true" className="text-primary" />
          )}
          <span className="font-medium text-foreground">
            {ocrBusy ? 'Reading the bill…' : 'Drop a bill photo, or tap to choose one'}
          </span>
          <span id="upload-hint" className="text-xs text-muted-foreground">
            JPG or PNG up to 8 MB
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-label="Bill photo"
          onChange={onInput}
        />

        {fileError ? (
          <p role="alert" className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {fileError}
          </p>
        ) : null}

        <Button variant="ghost" className="mt-4" onClick={() => navigate('/shopkeeper/create')}>
          Enter items by hand
        </Button>
      </div>

      <aside className="rounded-[28px] bg-card p-8">
        {ocrBusy ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Extracting line items
          </p>
        ) : null}

        {ocrDraft && !ocrBusy ? (
          <>
            <p className="text-[13px] text-muted-foreground">
              {ocrDraft.source === 'ocr' ? 'OCR preview' : 'Could not read this photo'}
            </p>
            <p className="mt-2 font-display text-4xl text-foreground">{ocrDraft.merchantName}</p>
            <p className="mt-3 font-display text-5xl text-foreground">{formatInr(ocrDraft.totalAmount)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {(ocrDraft.confidenceScore * 100).toFixed(0)}% catalog match
            </p>
            {ocrDraft.source === 'fallback' || ocrDraft.items.length === 0 ? (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                No reliable lines were found. Enter items by hand, or try a sharper, flatter photo.
              </p>
            ) : (
              <ul className="mt-6 space-y-2 text-sm">
                {ocrDraft.items.map((item) => (
                  <li key={`${item.name}-${item.quantity}-${item.price}`} className="flex justify-between gap-3">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="tabular-nums">{formatInr(item.quantity * item.price)}</span>
                  </li>
                ))}
              </ul>
            )}
            {ocrDraft.extractedText ? (
              <pre className="mt-5 max-h-40 overflow-auto rounded-2xl bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
                {ocrDraft.extractedText}
              </pre>
            ) : null}
            <Button
              size="lg"
              className="mt-8 w-full"
              onClick={() => navigate('/shopkeeper/create')}
              disabled={ocrDraft.items.length === 0}
            >
              <Camera /> Review and post
            </Button>
          </>
        ) : !ocrBusy ? (
          <>
            <p className="text-[13px] text-muted-foreground">Waiting for a photo</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Point the camera straight at the bill. Avoid glare. We never invent a sample bill if the photo cannot
              be read.
            </p>
          </>
        ) : null}
      </aside>
    </div>
  )
}

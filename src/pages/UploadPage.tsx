import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ImagePlus, Sparkles } from 'lucide-react'
import { CustomerSelect } from '../components/CustomerSelect'
import { Card } from '../components/ui/Card'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { BillSkeleton } from '../components/ui/Skeleton'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatRupee } from '../lib/format'
import { motionTokens, springs } from '../lib/motion-tokens'
import { useKhata } from '../store/KhataStore'

const MAX_BYTES = 8 * 1024 * 1024

function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'That file is not an image. Use a photo of the bill.'
  if (file.size > MAX_BYTES) return 'That photo is over 8 MB. Try a smaller or lower-resolution shot.'
  return null
}

export function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)
  const reduce = useReducedMotion()
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const { billDraft, ocrBusy, runOcr, updateBill } = useKhata()

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    }
  }, [])

  async function onFile(file: File) {
    const problem = validateImage(file)
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Capture</p>
        <h2 className="font-display mt-1 text-3xl sm:text-4xl">Upload bill</h2>
        <p className="mt-2 text-pretty text-sm text-paper-400">
          Photo → OCR → catalog match → QR. Without a readable photo the demo falls back to a sample kirana bill.
        </p>
      </div>

      <CustomerSelect />

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
        className={`flex w-full flex-col items-center gap-3 rounded-[28px] border border-dashed px-4 py-12 text-center transition-[background-color,border-color,transform] duration-200 sm:py-16 ${
          dragging ? 'border-teal-400 bg-teal-400/[0.06]' : 'border-teal-400/35 bg-white/50 hover:bg-white/80'
        } disabled:opacity-60`}
      >
        <ImagePlus size={24} aria-hidden="true" className="text-teal-400" />
        <span className="font-medium text-paper-100">
          {ocrBusy ? 'Reading the bill…' : 'Drop a bill photo, or tap to choose one'}
        </span>
        <span id="upload-hint" className="text-xs text-paper-400">
          JPG or PNG up to 8 MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Bill photo"
        onChange={onInput}
      />

      {fileError ? (
        <p role="alert" className="rounded-2xl bg-clay-400/10 px-4 py-3 text-sm text-clay-400">
          {fileError}
        </p>
      ) : null}

      {ocrBusy ? (
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-paper-100">
            <Sparkles size={16} aria-hidden="true" className="text-teal-400" />
            Extracting items
          </p>
          <div className="mt-4">
            <BillSkeleton />
          </div>
        </Card>
      ) : null}

      {billDraft && !ocrBusy ? (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : motionTokens.distance.md }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.gentle}
          className="grid gap-5 lg:grid-cols-[1fr_1.1fr]"
        >
          {billDraft.uploadedImageUrl ? (
            <img
              src={billDraft.uploadedImageUrl}
              alt="The uploaded bill"
              className="h-56 w-full rounded-[24px] object-cover sm:h-64"
            />
          ) : null}
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">OCR preview</h3>
              <StatusBadge tone={billDraft.confidenceScore >= 0.8 ? 'verified' : 'pending'}>
                {(billDraft.confidenceScore * 100).toFixed(0)}% confidence
              </StatusBadge>
            </div>
            <label className="mt-4 block text-sm text-paper-400">
              Merchant
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-paper-50 transition-[border-color] duration-150 focus:border-teal-400"
                value={billDraft.merchantName}
                onChange={(event) => updateBill({ merchantName: event.target.value })}
              />
            </label>
            <p className="mt-4 text-sm text-paper-400">Bill date {billDraft.billDate}</p>
            <pre className="mt-3 max-h-52 overflow-auto rounded-2xl bg-black/[0.04] p-4 text-xs leading-relaxed text-paper-200">
              {billDraft.extractedText}
            </pre>
            <p className="tabular mt-4 text-lg">Total {formatRupee(billDraft.totalAmount)}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <PrimaryButton className="w-full" onClick={() => navigate('/shop/match')}>
                Review items
              </PrimaryButton>
              <PrimaryButton variant="secondary" className="w-full" onClick={() => navigate('/shop/qr')}>
                Continue to QR
              </PrimaryButton>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </div>
  )
}

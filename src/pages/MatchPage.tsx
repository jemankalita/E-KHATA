import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { PRODUCT_CATALOG } from '../data/catalog'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatRupee } from '../lib/format'
import { springs } from '../lib/motion-tokens'
import { staggerContainer, useStaggerItem } from '../lib/useSafeMotion'
import { useKhata } from '../store/KhataStore'
import type { Item } from '../types'

function toneFor(item: Item): 'matched' | 'uncertain' | 'unmatched' {
  if (!item.matchedProductId) return 'unmatched'
  if (item.confidence >= 0.8) return 'matched'
  return 'uncertain'
}

export function MatchPage() {
  const navigate = useNavigate()
  const { billDraft, updateItems } = useKhata()
  const item = useStaggerItem()

  if (!billDraft) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          title="No bill to match"
          body="Upload a bill photo first — matched items and the bill total come from that scan."
          action={<PrimaryButton onClick={() => navigate('/shop/upload')}>Go to upload</PrimaryButton>}
        />
      </div>
    )
  }

  const draft = billDraft

  function patchItem(index: number, patch: Partial<Item>) {
    updateItems(draft.extractedItems.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Photo to product</p>
        <h2 className="font-display mt-1 text-3xl sm:text-4xl">Match items</h2>
        <p className="mt-2 text-pretty text-sm text-paper-400">
          Correct anything the scan guessed wrong. Picking a catalog product re-prices the line.
        </p>
      </div>

      {draft.extractedItems.length === 0 ? (
        <EmptyState
          title="No line items were read"
          body="The photo produced no usable rows. You can still raise a QR for the bill total."
          action={<PrimaryButton onClick={() => navigate('/shop/qr')}>Continue to QR</PrimaryButton>}
        />
      ) : (
        <motion.ul variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-3">
          {draft.extractedItems.map((line, index) => (
            <motion.li key={`${index}-${line.matchedProductId ?? 'none'}`} variants={item} transition={springs.gentle}>
              <Card className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="min-w-0 flex-1 text-sm text-paper-400">
                    Item name
                    <input
                      className="mt-1 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-paper-50 transition-[border-color] duration-150 focus:border-teal-400"
                      value={line.name}
                      onChange={(event) => patchItem(index, { name: event.target.value, matchedProductId: null })}
                    />
                  </label>
                  <StatusBadge tone={toneFor(line)} className="mt-6 shrink-0">
                    {toneFor(line)} · {(line.confidence * 100).toFixed(0)}%
                  </StatusBadge>
                </div>
                <p className="mt-2 text-sm text-paper-400">
                  Qty {line.quantity} · {formatRupee(line.price)}
                </p>
                <label className="mt-3 block text-sm text-paper-400">
                  Catalog suggestion
                  <select
                    className="mt-1 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-paper-50 transition-[border-color] duration-150 focus:border-teal-400"
                    value={line.matchedProductId ?? ''}
                    onChange={(event) => {
                      const product = PRODUCT_CATALOG.find((entry) => entry.id === event.target.value)
                      patchItem(index, {
                        matchedProductId: product?.id ?? null,
                        name: product?.name ?? line.name,
                        confidence: product ? 1 : 0,
                        price: product ? product.unitPrice * line.quantity : line.price,
                      })
                    }}
                  >
                    <option value="">Unmatched</option>
                    {PRODUCT_CATALOG.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="tabular text-lg">Bill total {formatRupee(draft.totalAmount)}</p>
        <PrimaryButton onClick={() => navigate('/shop/qr')}>Confirm and generate QR</PrimaryButton>
      </Card>
    </div>
  )
}

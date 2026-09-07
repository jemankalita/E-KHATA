import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CUSTOMER_NAME, DEMO_QR_ITEMS, sumItems } from '@/data/demo'
import { useKhata } from '@/hooks/useKhata'
import { PAY_BY_PRESETS, payByFromPreset, type PayByPreset } from '@/lib/payBy'
import { formatInr } from '@/lib/utils'
import type { TransactionItem } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function ShopkeeperCreatePage() {
  const { createMerchantQr, ocrDraft, setOcrDraft } = useKhata()
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState(CUSTOMER_NAME)
  const [payByPreset, setPayByPreset] = useState<PayByPreset>('7d')
  const [items, setItems] = useState<TransactionItem[]>(() =>
    ocrDraft && ocrDraft.items.length > 0
      ? ocrDraft.items.map((item) => ({ ...item }))
      : DEMO_QR_ITEMS.map((item) => ({ ...item })),
  )
  const total = sumItems(items)
  const fromPhoto = Boolean(ocrDraft && ocrDraft.items.length > 0)

  function updateItem(index: number, patch: Partial<TransactionItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function generate() {
    const cleaned = items.filter((item) => item.name.trim() && item.quantity > 0 && item.price >= 0)
    if (!customerName.trim() || cleaned.length === 0) {
      toast.error('Add a customer and at least one item.')
      return
    }
    createMerchantQr({
      customerName,
      items: cleaned,
      category: fromPhoto ? 'OCR bill' : 'Groceries',
      payBy: payByFromPreset(payByPreset),
    })
    setOcrDraft(null)
    toast.success('E-Khata QR generated')
    navigate('/shopkeeper/qr')
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
      <p className="text-[13px] text-accent">{fromPhoto ? 'From bill photo' : 'New entry'}</p>
      <h1 className="mt-2 font-display text-5xl leading-[1.05] text-foreground">
        {fromPhoto ? 'Review items' : 'Create transaction'}
      </h1>
      {fromPhoto ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Check names, quantities, and unit prices before posting. OCR can misread faded print.
        </p>
      ) : null}

      <div className="mt-8">
        <Label htmlFor="customer">Customer name</Label>
        <Input id="customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </div>

      <div className="mt-6">
        <Label>Pay by</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PAY_BY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setPayByPreset(preset.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                payByPreset === preset.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-[24px] bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Item {index + 1}</p>
              {items.length > 1 ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
            <Label>Item</Label>
            <Input value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  min={0}
                  value={item.price}
                  onChange={(e) => updateItem(index, { price: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-4"
        onClick={() => setItems((prev) => [...prev, { name: '', quantity: 1, price: 0 }])}
      >
        <Plus /> Add item
      </Button>
      </div>

      <aside className="rounded-[28px] bg-card p-8">
        <p className="text-[13px] text-muted-foreground">Bill total</p>
        <p className="mt-3 font-display text-6xl text-foreground">{formatInr(total)}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Posted to {customerName || 'the customer'} · they must pay within {PAY_BY_PRESETS.find((p) => p.id === payByPreset)?.label.toLowerCase()}.
        </p>
        <Button size="lg" className="mt-8 w-full" onClick={generate}>
          Generate E-Khata QR
        </Button>
      </aside>
    </div>
  )
}

import type { BillDraft, Item } from '../legacy/types'
import { PRODUCT_CATALOG } from '../data/catalog'
import { matchItems, matchProduct, overallConfidence } from './matching'

const SAMPLE_ITEMS: Item[] = [
  { name: 'Maggi Noodles', quantity: 2, price: 28, matchedProductId: null, confidence: 0 },
  { name: 'Parle G', quantity: 1, price: 10, matchedProductId: null, confidence: 0 },
  { name: 'Amul Milk 500ml', quantity: 1, price: 32, matchedProductId: null, confidence: 0 },
  { name: 'Lays Chips', quantity: 1, price: 20, matchedProductId: null, confidence: 0 },
]

export function simulateOcr(imageUrl: string): BillDraft {
  return draftFromItems(imageUrl, SAMPLE_ITEMS, 'Sharma Stores', cannedText())
}

export function parseReceiptText(text: string, imageUrl: string): BillDraft {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const merchantName =
    lines.find((line) => /store|mart|kirana|shop|canteen/i.test(line)) ??
    lines[0] ??
    'Unknown merchant'

  const items: Item[] = []
  for (const line of lines) {
    if (/total|subtotal|gst|tax|grand/i.test(line)) continue
    const amountMatch = line.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d{1,2})?)\s*$/i)
    const qtyMatch = line.match(/x\s*(\d+)/i)
    const name = line
      .replace(/(?:₹|rs\.?\s*)?\d+(?:\.\d{1,2})?\s*$/i, '')
      .replace(/x\s*\d+/i, '')
      .trim()
    if (!name || name.length < 3 || !amountMatch) continue
    const price = Number(amountMatch[1])
    if (!Number.isFinite(price) || price <= 0) continue
    items.push({
      name,
      quantity: qtyMatch ? Number(qtyMatch[1]) : 1,
      price,
      matchedProductId: null,
      confidence: 0,
    })
  }

  if (items.length === 0) {
    for (const product of PRODUCT_CATALOG) {
      if (new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)) {
        const { confidence } = matchProduct(product.name, PRODUCT_CATALOG)
        items.push({
          name: product.name,
          quantity: 1,
          price: product.unitPrice,
          matchedProductId: product.id,
          confidence,
        })
      }
    }
  }

  if (items.length === 0) return simulateOcr(imageUrl)
  return draftFromItems(imageUrl, items, merchantName, text)
}

function draftFromItems(imageUrl: string, items: Item[], merchantName: string, extractedText: string): BillDraft {
  const extractedItems = matchItems(items, PRODUCT_CATALOG)
  const subtotal = extractedItems.reduce((sum, item) => sum + item.price, 0)
  const totalFromText = extractedText.match(/(?:total|grand total)\s*(?:₹|rs\.?\s*)?(\d+)/i)
  const totalAmount = totalFromText ? Number(totalFromText[1]) : subtotal
  return {
    uploadedImageUrl: imageUrl,
    extractedText,
    extractedItems,
    merchantName,
    billDate: new Date().toISOString().slice(0, 10),
    subtotal,
    tax: 0,
    totalAmount: Number.isFinite(totalAmount) && totalAmount > 0 ? totalAmount : subtotal,
    confidenceScore: overallConfidence(extractedItems),
    needsReview: extractedItems.some((item) => item.confidence < 0.8),
  }
}

function cannedText() {
  return [
    'SHARMA STORES',
    'GSTIN: 27AABCS1234F1Z5',
    '06 Sep 2026  17:12',
    '--------------------------------',
    'Maggi Noodles     x2     ₹28',
    'Parle G           x1     ₹10',
    'Amul Milk 500ml   x1     ₹32',
    'Lays Chips        x1     ₹20',
    '--------------------------------',
    'TOTAL                   ₹90',
  ].join('\n')
}

export async function recognizeBill(imageUrl: string): Promise<BillDraft> {
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')
    const result = await worker.recognize(imageUrl)
    await worker.terminate()
    const text = result.data.text.trim()
    if (text.length < 8) return simulateOcr(imageUrl)
    return parseReceiptText(text, imageUrl)
  } catch {
    return simulateOcr(imageUrl)
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

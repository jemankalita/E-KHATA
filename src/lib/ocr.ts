import type { BillDraft, Item } from '../legacy/types'
import type { TransactionItem } from '../types'
import { PRODUCT_CATALOG } from '../data/catalog'
import { matchItems, overallConfidence } from './matching'

const SAMPLE_ITEMS: Item[] = [
  { name: 'Maggi Noodles', quantity: 2, price: 14, matchedProductId: null, confidence: 0 },
  { name: 'Parle G', quantity: 1, price: 10, matchedProductId: null, confidence: 0 },
  { name: 'Amul Milk 500ml', quantity: 1, price: 32, matchedProductId: null, confidence: 0 },
  { name: 'Lays Chips', quantity: 1, price: 20, matchedProductId: null, confidence: 0 },
]

export type OcrSource = 'ocr' | 'fallback'

export interface BillRecognition {
  uploadedImageUrl: string
  extractedText: string
  merchantName: string
  items: TransactionItem[]
  totalAmount: number
  confidenceScore: number
  needsReview: boolean
  source: OcrSource
  draft: BillDraft
}

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
    const item = parseLineItem(line)
    if (item) items.push(item)
  }

  return draftFromItems(imageUrl, items, merchantName, text)
}

export function toTransactionItems(draft: BillDraft): TransactionItem[] {
  return draft.extractedItems.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }))
}

export function toRecognition(draft: BillDraft, source: OcrSource): BillRecognition {
  return {
    uploadedImageUrl: draft.uploadedImageUrl ?? '',
    extractedText: draft.extractedText,
    merchantName: draft.merchantName,
    items: toTransactionItems(draft),
    totalAmount: draft.totalAmount,
    confidenceScore: draft.confidenceScore,
    needsReview: draft.needsReview || source === 'fallback' || draft.extractedItems.length === 0,
    source,
    draft,
  }
}

function emptyRecognition(imageUrl: string, extractedText: string): BillRecognition {
  return toRecognition(draftFromItems(imageUrl, [], 'Unknown merchant', extractedText), 'fallback')
}

function parseLineItem(line: string): Item | null {
  if (isNonItemLine(line)) return null

  const qtyFirst = line.match(/^(\d+)\s*[x×]\s+(.+?)\s+(?:₹|rs\.?\s*)?(\d+(?:\.\d{1,2})?)\s*$/i)
  if (qtyFirst) {
    return buildItem(qtyFirst[2] ?? '', Number(qtyFirst[1]), Number(qtyFirst[3]))
  }

  const qtyMid = line.match(/^(.+?)\s+[x×]\s*(\d+)\s+(?:₹|rs\.?\s*)?(\d+(?:\.\d{1,2})?)\s*$/i)
  if (qtyMid) {
    return buildItem(qtyMid[1] ?? '', Number(qtyMid[2]), Number(qtyMid[3]))
  }

  const simple = line.match(/^(.+?)\s+(?:₹|rs\.?\s*)?(\d+(?:\.\d{1,2})?)\s*$/i)
  if (simple) {
    return buildItem(simple[1] ?? '', 1, Number(simple[2]))
  }

  return null
}

function isNonItemLine(line: string): boolean {
  return /^(total|subtotal|gst|tax|grand|gstin|invoice|date|qty|item)\b/i.test(line)
}

function unitPrice(quantity: number, lineAmount: number): number {
  if (quantity > 1 && lineAmount > 0) {
    return Number((lineAmount / quantity).toFixed(2))
  }
  return lineAmount
}

function buildItem(rawName: string, quantity: number, lineAmount: number): Item | null {
  const name = rawName.replace(/[|]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!name || name.length < 3) return null
  if (!Number.isFinite(quantity) || quantity <= 0) return null
  if (!Number.isFinite(lineAmount) || lineAmount <= 0) return null
  return {
    name,
    quantity,
    price: unitPrice(quantity, lineAmount),
    matchedProductId: null,
    confidence: 0,
  }
}

function draftFromItems(imageUrl: string, items: Item[], merchantName: string, extractedText: string): BillDraft {
  const extractedItems = matchItems(items, PRODUCT_CATALOG)
  const subtotal = extractedItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
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
    needsReview: extractedItems.length === 0 || extractedItems.some((item) => item.confidence < 0.8),
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

export async function recognizeBill(imageUrl: string): Promise<BillRecognition> {
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')
    try {
      const result = await worker.recognize(imageUrl)
      const text = result.data.text.trim()
      if (text.length < 8) return emptyRecognition(imageUrl, text)
      return toRecognition(parseReceiptText(text, imageUrl), 'ocr')
    } finally {
      await worker.terminate()
    }
  } catch {
    return emptyRecognition(imageUrl, '')
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

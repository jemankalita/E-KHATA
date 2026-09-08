import { PRODUCT_CATALOG } from '@/data/catalog'
import { parseKhataQrValue } from '@/lib/khataQr'
import { normalizeName, similarity } from '@/lib/matching'
import { payByFromPreset } from '@/lib/payBy'
import type { PendingQr } from '@/types'
import type { Product } from '@/legacy/types'

const FUZZY_PHRASE_MIN_LENGTH = 5
const FUZZY_MATCH_THRESHOLD = 0.85

export interface ScanChargeContext {
  nextId: string
  merchant: string
  customerName: string
}

function catalogPhrases(product: Product): string[] {
  return [product.id.replace(/-/g, ' '), product.name, ...product.aliases]
    .map((name) => normalizeName(name))
    .filter((name) => name.length >= 3)
}

function containsPhrase(haystack: string, needle: string): boolean {
  if (!needle) return false
  if (haystack === needle) return true
  return ` ${haystack} `.includes(` ${needle} `)
}

function similarLength(left: string, right: string): boolean {
  const maxLen = Math.max(left.length, right.length)
  const minLen = Math.min(left.length, right.length)
  return maxLen > 0 && minLen / maxLen >= 0.8
}

export function findProductInPackText(raw: string): Product | null {
  const haystack = normalizeName(raw)
  if (!haystack) return null

  let best: Product | null = null
  let bestScore = 0
  const tokens = haystack.split(' ')

  for (const product of PRODUCT_CATALOG) {
    for (const phrase of catalogPhrases(product)) {
      if (containsPhrase(haystack, phrase)) {
        const score = phrase.length + 100
        if (score > bestScore) {
          best = product
          bestScore = score
        }
        continue
      }
      if (phrase.length < FUZZY_PHRASE_MIN_LENGTH) continue
      const n = phrase.split(' ').length
      for (let i = 0; i + n <= tokens.length; i += 1) {
        const window = tokens.slice(i, i + n).join(' ')
        if (!similarLength(window, phrase)) continue
        const closeness = similarity(window, phrase)
        if (closeness < FUZZY_MATCH_THRESHOLD) continue
        const score = phrase.length * closeness
        if (score > bestScore) {
          best = product
          bestScore = score
        }
      }
    }
  }

  return best
}

export function resolveScannedCharge(raw: string, context: ScanChargeContext): PendingQr | null {
  const bill = parseKhataQrValue(raw)
  if (bill) return bill

  const product = findProductInPackText(raw)
  if (!product) return null

  return {
    id: context.nextId,
    merchant: context.merchant,
    customerName: context.customerName,
    items: [{ name: product.name, quantity: 1, price: product.unitPrice }],
    amount: product.unitPrice,
    category: 'Retail',
    status: 'waiting',
    payBy: payByFromPreset('7d'),
  }
}

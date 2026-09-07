import { PRODUCT_CATALOG } from '@/data/catalog'
import { parseKhataQrValue } from '@/lib/khataQr'
import { normalizeName } from '@/lib/matching'
import { payByFromPreset } from '@/lib/payBy'
import type { PendingQr } from '@/types'
import type { Product } from '@/legacy/types'

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

export function findProductInPackText(raw: string): Product | null {
  const haystack = normalizeName(raw)
  if (!haystack) return null

  let best: Product | null = null
  let bestLength = 0

  for (const product of PRODUCT_CATALOG) {
    for (const phrase of catalogPhrases(product)) {
      if (!containsPhrase(haystack, phrase)) continue
      if (phrase.length > bestLength) {
        best = product
        bestLength = phrase.length
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

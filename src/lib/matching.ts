import type { Item, Product } from '../legacy/types'

export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[a.length][b.length]
}

export function similarity(left: string, right: string): number {
  const a = normalizeName(left)
  const b = normalizeName(right)
  if (!a || !b) return 0
  if (a === b) return 1
  if (a.includes(b) || b.includes(a)) return 0.88

  const distance = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return Math.max(0, 1 - distance / maxLen)
}

export function matchProduct(
  itemName: string,
  catalog: Product[],
): { product: Product | null; confidence: number } {
  let best: Product | null = null
  let bestScore = 0

  for (const product of catalog) {
    const names = [product.name, ...product.aliases]
    for (const name of names) {
      const score = similarity(itemName, name)
      if (score > bestScore) {
        bestScore = score
        best = product
      }
    }
  }

  if (bestScore < 0.45) return { product: null, confidence: bestScore }
  return { product: best, confidence: Number(bestScore.toFixed(2)) }
}

export function matchItems(items: Item[], catalog: Product[]): Item[] {
  return items.map((item) => {
    const { product, confidence } = matchProduct(item.name, catalog)
    return {
      ...item,
      matchedProductId: product?.id ?? null,
      confidence,
      name: confidence >= 0.8 && product ? product.name : item.name,
    }
  })
}

export function overallConfidence(items: Item[]): number {
  if (items.length === 0) return 0
  const sum = items.reduce((acc, item) => acc + item.confidence, 0)
  return Number((sum / items.length).toFixed(2))
}

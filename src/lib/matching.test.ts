import { describe, expect, it } from 'vitest'
import { PRODUCT_CATALOG } from '../data/catalog'
import { matchItems, matchProduct, normalizeName, similarity } from './matching'

describe('matching', () => {
  it('normalizes noisy OCR names', () => {
    expect(normalizeName('  MAGGI-Noodles!! ')).toBe('maggi noodles')
  })

  it('auto-matches high-confidence catalog names', () => {
    const result = matchProduct('Parle G', PRODUCT_CATALOG)
    expect(result.product?.id).toBe('parle-g')
    expect(result.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('leaves unrelated names unmatched', () => {
    const result = matchProduct('USB-C cable 2m', PRODUCT_CATALOG)
    expect(result.product).toBeNull()
  })

  it('scores exact names higher than distant names', () => {
    expect(similarity('Maggi', 'Maggi')).toBe(1)
    expect(similarity('Maggi', 'Oil')).toBeLessThan(0.5)
  })

  it('fills matchedProductId on item lists', () => {
    const matched = matchItems(
      [{ name: 'tata salt', quantity: 1, price: 28, matchedProductId: null, confidence: 0 }],
      PRODUCT_CATALOG,
    )
    expect(matched[0]?.matchedProductId).toBe('tata-salt')
  })
})

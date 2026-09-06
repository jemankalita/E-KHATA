import { describe, expect, it } from 'vitest'
import { parseReceiptText, simulateOcr } from './ocr'

describe('ocr', () => {
  it('returns structured receipt fields and a positive total', () => {
    const draft = simulateOcr('blob:mock')
    expect(draft.merchantName).toBe('Sharma Stores')
    expect(draft.totalAmount).toBe(90)
    expect(draft.extractedItems.length).toBeGreaterThan(0)
    expect(draft.extractedText).toContain('TOTAL')
  })

  it('parses line items from raw receipt text', () => {
    const draft = parseReceiptText(
      ['Kalita Kirana', 'Maggi x2 28', 'Parle-G 10', 'TOTAL 38'].join('\n'),
      'blob:mock',
    )
    expect(draft.merchantName).toMatch(/Kirana/i)
    expect(draft.extractedItems.length).toBeGreaterThanOrEqual(2)
    expect(draft.totalAmount).toBe(38)
  })
})

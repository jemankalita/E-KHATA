import { describe, expect, it, vi } from 'vitest'
import { parseReceiptText, simulateOcr, toTransactionItems } from './ocr'

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

  it('stores unit price when a line has quantity and a line total', () => {
    const draft = parseReceiptText(['Kalita Kirana', 'Maggi Noodles x2 28', 'TOTAL 28'].join('\n'), 'blob:mock')
    const maggi = draft.extractedItems.find((item) => /maggi/i.test(item.name))
    expect(maggi?.quantity).toBe(2)
    expect(maggi?.price).toBe(14)
  })

  it('parses quantity-first lines like 2 x Maggi 28', () => {
    const draft = parseReceiptText(['Campus Canteen', '2 x Maggi 28', 'TOTAL 28'].join('\n'), 'blob:mock')
    const maggi = draft.extractedItems.find((item) => /maggi/i.test(item.name))
    expect(maggi?.quantity).toBe(2)
    expect(maggi?.price).toBe(14)
  })

  it('does not invent a sample bill when no line items are readable', () => {
    const draft = parseReceiptText('blurry photo\n???\n', 'blob:mock')
    expect(draft.extractedItems).toEqual([])
    expect(draft.totalAmount).toBe(0)
    expect(draft.extractedText).not.toContain('SHARMA STORES')
  })

  it('does not invent catalog items from a keyword-only blob', () => {
    const draft = parseReceiptText('maybe maggi somewhere\nno prices', 'blob:mock')
    expect(draft.extractedItems).toEqual([])
    expect(draft.totalAmount).toBe(0)
  })

  it('maps extracted items to transaction line items', () => {
    const draft = parseReceiptText(['Shop', 'Parle G x1 10', 'TOTAL 10'].join('\n'), 'blob:mock')
    expect(toTransactionItems(draft)).toEqual([{ name: expect.stringMatching(/parle/i), quantity: 1, price: 10 }])
  })
})

describe('recognizeBill', () => {
  it('returns OCR-sourced items when Tesseract reads a receipt', async () => {
    vi.resetModules()
    vi.doMock('tesseract.js', () => ({
      createWorker: vi.fn(async () => ({
        recognize: vi.fn(async () => ({
          data: { text: 'Kalita Kirana\nMaggi x2 28\nTOTAL 28\n' },
        })),
        terminate: vi.fn(async () => undefined),
      })),
    }))
    const { recognizeBill: recognize } = await import('./ocr')
    const result = await recognize('blob:bill')
    expect(result.source).toBe('ocr')
    expect(result.items.length).toBeGreaterThanOrEqual(1)
    expect(result.totalAmount).toBe(28)
    expect(result.merchantName).toMatch(/Kirana/i)
  })

  it('marks a fallback instead of pretending OCR succeeded', async () => {
    vi.resetModules()
    vi.doMock('tesseract.js', () => ({
      createWorker: vi.fn(async () => {
        throw new Error('worker failed')
      }),
    }))
    const { recognizeBill: recognize } = await import('./ocr')
    const result = await recognize('blob:bill')
    expect(result.source).toBe('fallback')
    expect(result.items).toEqual([])
    expect(result.totalAmount).toBe(0)
  })
})

import { describe, expect, it, vi } from 'vitest'

describe('recognizePackLabel', () => {
  it('OCRs a pack photo and maps Amul milk to the catalog product', async () => {
    vi.resetModules()
    vi.doMock('tesseract.js', () => ({
      createWorker: vi.fn(async () => ({
        recognize: vi.fn(async () => ({
          data: { text: 'AMUL TAAZA TONED MILK 500ml' },
        })),
        terminate: vi.fn(async () => undefined),
      })),
    }))
    const { recognizePackLabel } = await import('./recognizePack')
    const product = await recognizePackLabel('blob:pack')
    expect(product?.id).toBe('milk')
    expect(product?.unitPrice).toBe(32)
  })

  it('returns null when the photo is not a catalog pack', async () => {
    vi.resetModules()
    vi.doMock('tesseract.js', () => ({
      createWorker: vi.fn(async () => ({
        recognize: vi.fn(async () => ({
          data: { text: 'random cardboard' },
        })),
        terminate: vi.fn(async () => undefined),
      })),
    }))
    const { recognizePackLabel } = await import('./recognizePack')
    expect(await recognizePackLabel('blob:blank')).toBeNull()
  })
})

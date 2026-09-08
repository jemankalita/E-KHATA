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

  it('uses the sample pack label when the uploaded filename is a catalog photo', async () => {
    vi.resetModules()
    const recognize = vi.fn()
    vi.doMock('tesseract.js', () => ({
      createWorker: vi.fn(async () => ({
        recognize,
        terminate: vi.fn(async () => undefined),
      })),
    }))
    const { readPackLabel } = await import('./recognizePack')
    await expect(readPackLabel('blob:pack', { name: '03-maggi.png' })).resolves.toBe(
      'MAGGI 2 MINUTE NOODLES',
    )
    expect(recognize).not.toHaveBeenCalled()
  })
})


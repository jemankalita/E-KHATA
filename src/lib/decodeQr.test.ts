import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import jsQR from 'jsqr'
import { decodeQrFromFile, decodeQrFromRgba, decodeQrFromVideoFrame } from './decodeQr'

vi.mock('jsqr', () => ({
  default: vi.fn(),
}))

const mockedJsQR = vi.mocked(jsQR)

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('decodeQrFromRgba', () => {
  beforeEach(() => {
    mockedJsQR.mockReset()
  })

  it('returns the payload when a QR is present', () => {
    mockedJsQR.mockReturnValue({ data: 'https://e-khata.local/pay?ref=bill-1' } as ReturnType<typeof jsQR>)
    const pixels = new Uint8ClampedArray(4)
    expect(decodeQrFromRgba(pixels, 1, 1)).toBe('https://e-khata.local/pay?ref=bill-1')
    expect(mockedJsQR).toHaveBeenCalledWith(pixels, 1, 1, { inversionAttempts: 'attemptBoth' })
  })

  it('returns null when no QR is present', () => {
    mockedJsQR.mockReturnValue(null)
    expect(decodeQrFromRgba(new Uint8ClampedArray(4), 1, 1)).toBeNull()
  })
})

describe('decodeQrFromFile', () => {
  beforeEach(() => {
    mockedJsQR.mockReset()
  })

  it('reads a QR from a photo without BarcodeDetector', async () => {
    mockedJsQR.mockReturnValue({ data: 'https://e-khata.local/pay?ref=photo' } as ReturnType<typeof jsQR>)
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(16),
        width: 2,
        height: 2,
      })),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({ width: 2, height: 2, close: vi.fn() })),
    )

    const file = new File([new Uint8Array([1, 2, 3])], 'qr.png', { type: 'image/png' })
    await expect(decodeQrFromFile(file)).resolves.toBe('https://e-khata.local/pay?ref=photo')
  })
})

describe('decodeQrFromVideoFrame', () => {
  beforeEach(() => {
    mockedJsQR.mockReset()
  })

  it('decodes a live camera frame', () => {
    mockedJsQR.mockReturnValue({ data: 'https://e-khata.local/pay?ref=live' } as ReturnType<typeof jsQR>)
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(16),
        width: 2,
        height: 2,
      })),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
    const video = { videoWidth: 2, videoHeight: 2 } as HTMLVideoElement
    expect(decodeQrFromVideoFrame(video)).toBe('https://e-khata.local/pay?ref=live')
  })
})

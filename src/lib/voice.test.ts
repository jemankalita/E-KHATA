import { afterEach, describe, expect, it, vi } from 'vitest'
import { confirmationLine, playConfirmation } from './voice'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('confirmationLine', () => {
  it('speaks Hinglish with the exact rupee amount for any bill, not only demo totals', () => {
    expect(confirmationLine(25)).toBe('25 rupees E-Khata mein add ho gaye.')
    expect(confirmationLine(105)).toBe('105 rupees E-Khata mein add ho gaye.')
    expect(confirmationLine(2499.5)).toBe('2499.50 rupees E-Khata mein add ho gaye.')
    expect(confirmationLine(7)).not.toContain('₹')
  })
})

describe('playConfirmation', () => {
  it('prefers the ElevenLabs proxy and never calls the public API from the browser', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url === '/api/voice') {
        return Promise.resolve(new Response(new Blob(['audio'], { type: 'audio/mpeg' }), { status: 200 }))
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)
    class FakeAudio {
      addEventListener(type: string, handler: () => void) {
        if (type === 'playing') handler()
      }
      play() {
        return Promise.resolve()
      }
    }
    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:voice' })

    await expect(playConfirmation(2499.5, false)).resolves.toBe('elevenlabs')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/voice',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: confirmationLine(2499.5) }),
      }),
    )
    expect(fetchMock.mock.calls.every(([url]) => !String(url).includes('elevenlabs.io'))).toBe(true)
  })

  it('stays silent when muted', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(playConfirmation(40, true)).resolves.toBe('muted')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { confirmationLine, playConfirmation, resetVoicePlaybackForTests, unlockVoicePlayback } from './voice'

afterEach(() => {
  resetVoicePlaybackForTests()
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

  it('unlocks playback even when the browser play() call returns nothing', () => {
    class SilentAudio {
      src = ''
      muted = false
      play() {}
    }
    vi.stubGlobal('Audio', SilentAudio)
    expect(() => unlockVoicePlayback()).not.toThrow()
  })

  it('unlocks the same audio element before ElevenLabs returns so a QR confirm can speak', async () => {
    let releaseFetch: (value: Response) => void = () => undefined
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          releaseFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const plays: string[] = []
    class FakeAudio {
      src = ''
      muted = false
      currentTime = 0
      pause() {}
      addEventListener(type: string, handler: () => void) {
        if (type === 'playing') handler()
      }
      play() {
        plays.push(this.src)
        return Promise.resolve()
      }
    }
    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:voice' })

    const pending = playConfirmation(77, false)
    await Promise.resolve()
    expect(plays.length).toBeGreaterThan(0)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/voice',
      expect.objectContaining({ method: 'POST' }),
    )

    releaseFetch(new Response(new Blob(['audio'], { type: 'audio/mpeg' }), { status: 200 }))
    await expect(pending).resolves.toBe('elevenlabs')
    expect(plays).toContain('blob:voice')
  })
})


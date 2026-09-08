import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  confirmationLine,
  pickFemaleHindiVoice,
  playConfirmation,
  resetVoicePlaybackForTests,
  unlockVoicePlayback,
} from './voice'

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

  it('plays ElevenLabs audio through a resumed AudioContext after a later QR scan', async () => {
    const started: ArrayBuffer[] = []
    class FakeBufferSource {
      buffer: AudioBuffer | null = null
      connect() {}
      start() {
        if (this.buffer) started.push(this.buffer as unknown as ArrayBuffer)
      }
    }
    class FakeAudioContext {
      state = 'running'
      resume() {
        this.state = 'running'
        return Promise.resolve()
      }
      decodeAudioData(data: ArrayBuffer) {
        return Promise.resolve({ byteLength: data.byteLength } as unknown as AudioBuffer)
      }
      createBufferSource() {
        return new FakeBufferSource()
      }
      get destination() {
        return {}
      }
    }
    vi.stubGlobal(
      'AudioContext',
      FakeAudioContext as unknown as typeof AudioContext,
    )
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(new Uint8Array([1, 2, 3]).buffer, { status: 200 }))))
    class SilentAudio {
      src = ''
      muted = false
      play() {
        return Promise.resolve()
      }
    }
    vi.stubGlobal('Audio', SilentAudio)

    await expect(playConfirmation(40, false)).resolves.toBe('elevenlabs')
    expect(started.length).toBe(1)
  })

  it('falls back to a female Hindi speech-synthesis voice when ElevenLabs is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('', { status: 502 }))))
    const spoken: SpeechSynthesisUtterance[] = []
    const kalpana = { name: 'Microsoft Kalpana - Hindi (India)', lang: 'hi-IN' }
    class FakeUtterance {
      text: string
      lang = ''
      rate = 1
      volume = 1
      voice: { name: string; lang: string } | null = null
      constructor(text: string) {
        this.text = text
      }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [
        { name: 'Microsoft Hemant - Hindi (India)', lang: 'hi-IN' },
        kalpana,
      ],
      cancel() {},
      speak(utterance: SpeechSynthesisUtterance) {
        spoken.push(utterance)
      },
    })
    class SilentAudio {
      src = ''
      muted = false
      play() {
        return Promise.resolve()
      }
      addEventListener() {}
    }
    vi.stubGlobal('Audio', SilentAudio)

    await expect(playConfirmation(25, false)).resolves.toBe('speech')
    const audible = spoken.find((line) => line.text.includes('25 rupees'))
    expect(audible?.lang).toBe('hi-IN')
    expect(audible?.voice).toEqual(kalpana)
  })
})

describe('pickFemaleHindiVoice', () => {
  it('prefers a female Hindi voice over a male Hindi voice', () => {
    const voice = pickFemaleHindiVoice([
      { name: 'Microsoft Hemant - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Kalpana - Hindi (India)', lang: 'hi-IN' },
      { name: 'Google US English', lang: 'en-US' },
    ])
    expect(voice?.name).toMatch(/Kalpana/i)
  })
})


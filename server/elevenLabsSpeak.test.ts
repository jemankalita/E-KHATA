import { describe, expect, it, vi } from 'vitest'
import { elevenLabsSpeechUrl, normalizeVoiceText, requestElevenLabsAudio } from './elevenLabsSpeak'

describe('elevenLabsSpeak', () => {
  it('trims and caps the spoken line', () => {
    expect(normalizeVoiceText('  hello  ')).toBe('hello')
    expect(normalizeVoiceText('x'.repeat(400)).length).toBe(300)
    expect(normalizeVoiceText('   ')).toBe('')
  })

  it('posts to ElevenLabs with the Sia voice settings and returns mpeg audio', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
      }),
    )
    const result = await requestElevenLabsAudio({
      text: '77 rupees E-Khata mein add ho gaye.',
      apiKey: 'test-key',
      voiceId: 'sia-voice',
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.audio.byteLength).toBe(3)
    expect(fetchMock).toHaveBeenCalledWith(
      elevenLabsSpeechUrl('sia-voice'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'xi-api-key': 'test-key',
          Accept: 'audio/mpeg',
        }),
      }),
    )
  })
})

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SIA_VOICE_ID,
  ELEVENLABS_OUTPUT_FORMAT,
  ELEVENLABS_TTS_MODEL,
  ELEVENLABS_VOICE_SETTINGS,
} from './elevenLabsVoice'

describe('elevenLabsVoice', () => {
  it('uses Sia with Multilingual v2 and natural companion settings', () => {
    expect(DEFAULT_SIA_VOICE_ID).toBe('qkLUiyjSsACrPg8T6WoF')
    expect(ELEVENLABS_TTS_MODEL).toBe('eleven_multilingual_v2')
    expect(ELEVENLABS_OUTPUT_FORMAT).toBe('mp3_44100_128')
    expect(ELEVENLABS_VOICE_SETTINGS).toEqual({
      stability: 0.9,
      similarity_boost: 0.95,
      style: 0,
      use_speaker_boost: true,
      speed: 0.82,
    })
  })
})

import {
  ELEVENLABS_OUTPUT_FORMAT,
  ELEVENLABS_TTS_MODEL,
  ELEVENLABS_VOICE_SETTINGS,
} from '../src/lib/elevenLabsVoice.ts'

export const VOICE_TEXT_MAX = 300

export function elevenLabsSpeechUrl(voiceId: string): string {
  return `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${ELEVENLABS_OUTPUT_FORMAT}`
}

export function normalizeVoiceText(raw: unknown, max = VOICE_TEXT_MAX): string {
  return String(raw ?? '').trim().slice(0, max)
}

export async function requestElevenLabsAudio(input: {
  text: string
  apiKey: string
  voiceId: string
  fetchImpl?: typeof fetch
}): Promise<{ ok: true; audio: ArrayBuffer } | { ok: false }> {
  const fetchImpl = input.fetchImpl ?? fetch
  try {
    const response = await fetchImpl(elevenLabsSpeechUrl(input.voiceId), {
      method: 'POST',
      headers: {
        'xi-api-key': input.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: input.text,
        model_id: ELEVENLABS_TTS_MODEL,
        voice_settings: ELEVENLABS_VOICE_SETTINGS,
      }),
    })
    if (!response.ok) return { ok: false }
    return { ok: true, audio: await response.arrayBuffer() }
  } catch {
    return { ok: false }
  }
}

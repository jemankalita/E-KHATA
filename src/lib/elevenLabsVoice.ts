/** Sia — Warm & Real Companion (ElevenLabs voice library). */
export const DEFAULT_SIA_VOICE_ID = 'qkLUiyjSsACrPg8T6WoF'

/** @deprecated Use DEFAULT_SIA_VOICE_ID */
export const DEFAULT_INDIAN_MALE_HINGLISH_VOICE_ID = DEFAULT_SIA_VOICE_ID

export const ELEVENLABS_TTS_MODEL = 'eleven_multilingual_v2'
export const ELEVENLABS_OUTPUT_FORMAT = 'mp3_44100_128'

/** Matches the ElevenLabs TTS dashboard: slower, highly stable, speaker boost on. */
export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.9,
  similarity_boost: 0.95,
  style: 0,
  use_speaker_boost: true,
  speed: 0.82,
}

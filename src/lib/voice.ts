import { apiUrl } from './api'

const LOCAL_AUDIO = ['/audio/confirm.mp3', '/audio/confirm.wav']
/** Tiny silent WAV so unlock does not depend on a missing public file. */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

let sessionAudio: HTMLAudioElement | null = null
let audioCtx: AudioContext | null = null
let primed = false

export function spokenRupees(amount: number): string {
  if (!Number.isFinite(amount)) return '0'
  const rounded = Math.round(amount * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

export function confirmationLine(amount: number): string {
  return `${spokenRupees(amount)} rupees E-Khata mein add ho gaye.`
}

export function pickFemaleHindiVoice<T extends { name: string; lang: string }>(voices: T[]): T | undefined {
  const hindi = voices.filter(
    (voice) => /^hi([-_]|$)/i.test(voice.lang) || /hindi/i.test(voice.name),
  )
  const female = /female|woman|kalpana|lekha|heera|swara|ananya|neerja|kajal/i
  const male = /male|\bman\b|hemant|ravi|prabhat/i
  return (
    hindi.find((voice) => female.test(voice.name) && !male.test(voice.name)) ??
    hindi.find((voice) => !male.test(voice.name)) ??
    hindi[0]
  )
}

export function resetVoicePlaybackForTests() {
  sessionAudio = null
  audioCtx = null
  primed = false
}

function getSessionAudio(): HTMLAudioElement {
  if (!sessionAudio) sessionAudio = new Audio()
  return sessionAudio
}

function audioContextCtor(): (typeof AudioContext) | undefined {
  if (typeof window === 'undefined') return undefined
  return window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
}

function ensureAudioContext(): AudioContext | null {
  const Ctor = audioContextCtor()
  if (!Ctor) return null
  if (!audioCtx) audioCtx = new Ctor()
  return audioCtx
}

/** Keep a single audio element / AudioContext unlocked across the ElevenLabs round-trip. */
export function unlockVoicePlayback(): void {
  const ctx = ensureAudioContext()
  if (ctx && ctx.state !== 'closed') void ctx.resume()

  if (typeof Audio === 'undefined') return
  const audio = getSessionAudio()
  if (!primed) {
    audio.muted = true
    audio.src = SILENT_WAV
    primed = true
  }
  void Promise.resolve(audio.play())
    .then(() => {
      audio.muted = false
    })
    .catch(() => {
      audio.muted = false
    })

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const warm = new SpeechSynthesisUtterance(' ')
      warm.volume = 0
      warm.lang = 'hi-IN'
      window.speechSynthesis.speak(warm)
    } catch {
      /* browsers may reject speak() outside a gesture */
    }
  }
}

async function playDecodedBuffer(data: ArrayBuffer): Promise<boolean> {
  if (!audioCtx) return false
  try {
    await audioCtx.resume()
    if (audioCtx.state !== 'running') return false
    const decoded = await audioCtx.decodeAudioData(data.slice(0))
    const source = audioCtx.createBufferSource()
    source.buffer = decoded
    source.connect(audioCtx.destination)
    source.start(0)
    return true
  } catch {
    return false
  }
}

async function playHtmlAudio(src: string): Promise<boolean> {
  const audio = getSessionAudio()
  audio.muted = false
  audio.src = src
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(false), 2500)
    const finish = (ok: boolean) => {
      window.clearTimeout(timer)
      resolve(ok)
    }
    audio.addEventListener('playing', () => finish(true), { once: true })
    audio.addEventListener('error', () => finish(false), { once: true })
    void Promise.resolve(audio.play()).catch(() => finish(false))
  })
}

async function playLocalAudio(): Promise<boolean> {
  for (const src of LOCAL_AUDIO) {
    const ok = await playHtmlAudio(src)
    if (ok) return true
  }
  return false
}

async function playElevenLabs(text: string): Promise<boolean> {
  try {
    const response = await fetch(apiUrl('/api/voice'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) return false
    const buffer = await response.arrayBuffer()
    if (await playDecodedBuffer(buffer)) return true
    const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }))
    return playHtmlAudio(url)
  } catch {
    return false
  }
}

function playSpeechSynthesis(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'hi-IN'
  utterance.rate = 0.95
  const voice = pickFemaleHindiVoice(window.speechSynthesis.getVoices())
  if (voice) utterance.voice = voice
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return true
}

export async function playConfirmation(
  amount: number,
  muted: boolean,
): Promise<'local' | 'elevenlabs' | 'speech' | 'muted'> {
  if (muted) return 'muted'
  unlockVoicePlayback()
  const text = confirmationLine(amount)
  const elevenOk = await playElevenLabs(text)
  if (elevenOk) return 'elevenlabs'
  if (playSpeechSynthesis(text)) return 'speech'
  const localOk = await playLocalAudio()
  if (localOk) return 'local'
  return 'speech'
}

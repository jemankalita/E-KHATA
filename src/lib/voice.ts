import { apiUrl } from './api'

const LOCAL_AUDIO = ['/audio/confirm.mp3', '/audio/confirm.wav']

let sessionAudio: HTMLAudioElement | null = null
let primed = false

export function spokenRupees(amount: number): string {
  if (!Number.isFinite(amount)) return '0'
  const rounded = Math.round(amount * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

export function confirmationLine(amount: number): string {
  return `${spokenRupees(amount)} rupees E-Khata mein add ho gaye.`
}

export function resetVoicePlaybackForTests() {
  sessionAudio = null
  primed = false
}

function getSessionAudio(): HTMLAudioElement {
  if (!sessionAudio) sessionAudio = new Audio()
  return sessionAudio
}

/** Keep a single audio element unlocked across the ElevenLabs round-trip. */
export function unlockVoicePlayback(): void {
  if (typeof Audio === 'undefined') return
  const audio = getSessionAudio()
  if (!primed) {
    audio.muted = true
    audio.src = LOCAL_AUDIO[0]
    primed = true
  }
  void Promise.resolve(audio.play())
    .then(() => {
      audio.muted = false
    })
    .catch(() => {
      audio.muted = false
    })
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
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
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

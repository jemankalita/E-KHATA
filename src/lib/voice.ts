const LOCAL_AUDIO = ['/audio/confirm.mp3', '/audio/confirm.wav']

export function spokenRupees(amount: number): string {
  if (!Number.isFinite(amount)) return '0'
  const rounded = Math.round(amount * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

export function confirmationLine(amount: number): string {
  return `${spokenRupees(amount)} rupees E-Khata mein add ho gaye.`
}

async function playHtmlAudio(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(src)
    const timer = window.setTimeout(() => resolve(false), 2500)
    audio.addEventListener(
      'playing',
      () => {
        window.clearTimeout(timer)
        resolve(true)
      },
      { once: true },
    )
    audio.addEventListener(
      'error',
      () => {
        window.clearTimeout(timer)
        resolve(false)
      },
      { once: true },
    )
    void audio.play().catch(() => {
      window.clearTimeout(timer)
      resolve(false)
    })
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
    const response = await fetch('/api/voice', {
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
  const text = confirmationLine(amount)
  const elevenOk = await playElevenLabs(text)
  if (elevenOk) return 'elevenlabs'
  if (playSpeechSynthesis(text)) return 'speech'
  const localOk = await playLocalAudio()
  if (localOk) return 'local'
  return 'speech'
}

import { DEFAULT_SIA_VOICE_ID } from '../src/lib/elevenLabsVoice.ts'
import { normalizeVoiceText, requestElevenLabsAudio } from '../server/elevenLabsSpeak.ts'

type VoiceReq = {
  method?: string
  body?: unknown
}

type VoiceRes = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void; end: (chunk?: unknown) => void }
  end: (chunk?: unknown) => void
}

function cors(res: VoiceRes) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VoiceReq, res: VoiceRes) {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const raw = req.body
  const body = typeof raw === 'string' ? (JSON.parse(raw) as { text?: unknown }) : ((raw ?? {}) as { text?: unknown })
  const text = normalizeVoiceText(body.text)
  if (!text) {
    res.status(400).json({ error: 'Voice text is required.' })
    return
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || ''
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_SIA_VOICE_ID
  if (!apiKey) {
    res.status(503).json({ error: 'ElevenLabs is not configured.' })
    return
  }

  const spoken = await requestElevenLabsAudio({ text, apiKey, voiceId })
  if (!spoken.ok) {
    res.status(502).json({ error: 'ElevenLabs could not speak this line.' })
    return
  }

  res.setHeader('Content-Type', 'audio/mpeg')
  res.status(200).end(Buffer.from(spoken.audio))
}

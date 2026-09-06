import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite'
import { CUSTOMERS, TRANSACTIONS } from '../src/data/seed.ts'
import { addToKhata, autoSettleDue, settleCustomer } from '../src/lib/khata.ts'
import type { KhataSnapshot, PayIntent } from '../src/lib/payLink.ts'
import type { Item, PaymentMode } from '../src/legacy/types.ts'

const STATE_PATH = join(process.cwd(), '.data', 'khata-state.json')

interface FileState extends KhataSnapshot {
  intents: PayIntent[]
}

const clients = new Set<ServerResponse>()

let state: FileState = loadState()

function loadState(): FileState {
  try {
    const parsed = JSON.parse(readFileSync(STATE_PATH, 'utf8')) as FileState
    if (Array.isArray(parsed.customers) && Array.isArray(parsed.transactions)) {
      return { ...parsed, intents: parsed.intents ?? [] }
    }
  } catch {
    // first run
  }
  return {
    customers: CUSTOMERS,
    transactions: TRANSACTIONS,
    intents: [],
  }
}

function persist() {
  mkdirSync(dirname(STATE_PATH), { recursive: true })
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

function broadcast(event: Record<string, unknown>) {
  const payload = `data: ${JSON.stringify(event)}\n\n`
  for (const client of clients) client.write(payload)
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>)
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function snapshot(): KhataSnapshot {
  return { customers: state.customers, transactions: state.transactions }
}

function applyDueSettlements() {
  const result = autoSettleDue(state.customers, state.transactions)
  if (result.settledCustomerIds.length === 0) return
  state = { ...state, customers: result.customers, transactions: result.transactions }
  persist()
  broadcast({ type: 'settled', settledAmount: result.settledAmount, ...snapshot() })
}

async function handle(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (!url.pathname.startsWith('/api/')) {
    next()
    return
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/state') {
    applyDueSettlements()
    json(res, 200, snapshot())
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.write(`data: ${JSON.stringify({ type: 'hello', ...snapshot() })}\n\n`)
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/intent/')) {
    const referenceId = decodeURIComponent(url.pathname.replace('/api/intent/', ''))
    const intent = state.intents.find((entry) => entry.referenceId === referenceId)
    if (!intent) {
      json(res, 404, { error: 'QR is expired or unknown.' })
      return
    }
    const customer = state.customers.find((entry) => entry.id === intent.customerId)
    json(res, 200, { intent, customer, snapshot: snapshot() })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/intent') {
    const body = await readBody(req)
    const intent: PayIntent = {
      referenceId: String(body.referenceId),
      customerId: String(body.customerId),
      merchantName: String(body.merchantName),
      amount: Number(body.amount),
      items: (body.items as Item[]) ?? [],
      paymentMode: (body.paymentMode as PaymentMode) ?? 'qr',
      createdAt: new Date().toISOString(),
      status: 'waiting',
    }
    if (!intent.referenceId || !intent.customerId || !Number.isFinite(intent.amount) || intent.amount <= 0) {
      json(res, 400, { error: 'Select a customer and enter a valid amount.' })
      return
    }
    state = {
      ...state,
      intents: [intent, ...state.intents.filter((entry) => entry.referenceId !== intent.referenceId)],
    }
    persist()
    json(res, 200, { intent })
    return
  }

  if (req.method === 'POST' && url.pathname.endsWith('/confirm')) {
    const referenceId = decodeURIComponent(url.pathname.replace('/api/intent/', '').replace('/confirm', ''))
    const intent = state.intents.find((entry) => entry.referenceId === referenceId)
    if (!intent) {
      json(res, 404, { error: 'This QR is no longer valid.' })
      return
    }
    if (intent.status === 'confirmed') {
      json(res, 409, { error: 'This bill is already on the khata.' })
      return
    }
    const customer = state.customers.find((entry) => entry.id === intent.customerId)
    if (!customer) {
      json(res, 400, { error: 'Customer account not found. Select an account first.' })
      return
    }
    const result = addToKhata(state.customers, state.transactions, {
      customer,
      merchantName: intent.merchantName,
      amount: intent.amount,
      items: intent.items,
      paymentMode: intent.paymentMode,
      referenceId: intent.referenceId,
    })
    state = {
      customers: result.customers,
      transactions: result.transactions,
      intents: state.intents.map((entry) =>
        entry.referenceId === referenceId ? { ...entry, status: 'confirmed' } : entry,
      ),
    }
    persist()
    const payload = { type: 'committed', transaction: result.transaction, ...snapshot() }
    broadcast(payload)
    json(res, 200, payload)
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/voice') {
    const body = await readBody(req)
    const text = String(body.text ?? '').trim()
    const key = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY
    const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.VITE_ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'
    if (!text) {
      json(res, 400, { error: 'Voice text is required.' })
      return
    }
    if (!key) {
      json(res, 503, { error: 'ElevenLabs is not configured.' })
      return
    }
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })
    if (!response.ok) {
      json(res, 502, { error: 'ElevenLabs could not speak this line.' })
      return
    }
    const audio = Buffer.from(await response.arrayBuffer())
    res.statusCode = 200
    res.setHeader('Content-Type', 'audio/mpeg')
    res.end(audio)
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/settle') {
    const body = await readBody(req)
    const customerId = String(body.customerId ?? '')
    const result = settleCustomer(state.customers, state.transactions, customerId)
    state = { ...state, customers: result.customers, transactions: result.transactions }
    persist()
    const payload = { type: 'settled', settledAmount: result.settledAmount, ...snapshot() }
    broadcast(payload)
    json(res, 200, payload)
    return
  }

  json(res, 404, { error: 'Not found' })
}

function attach(middlewares: Connect.Server) {
  middlewares.use((req, res, next) => {
    void handle(req as IncomingMessage, res as ServerResponse, next).catch((error: Error) => {
      json(res as ServerResponse, 500, { error: error.message })
    })
  })
}

export function khataApiPlugin(): Plugin {
  return {
    name: 'ekhata-api',
    configureServer(server: ViteDevServer) {
      attach(server.middlewares)
    },
    configurePreviewServer(server: PreviewServer) {
      attach(server.middlewares)
    },
  }
}

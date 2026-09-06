type LiveStore = Map<string, unknown>

const store: LiveStore = ((globalThis as { __ekhataLiveQr?: LiveStore }).__ekhataLiveQr ??=
  new Map())

export default async function handler(
  req: { method?: string; query?: { id?: string | string[] }; body?: unknown },
  res: {
    setHeader: (name: string, value: string) => void
    status: (code: number) => { json: (body: unknown) => void; end: () => void }
  },
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const rawId = req.query?.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  if (!id) {
    res.status(400).json({ error: 'Missing id' })
    return
  }

  if (req.method === 'GET') {
    const found = store.get(id)
    if (!found) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.status(200).json(found)
    return
  }

  if (req.method === 'PUT') {
    const raw = req.body
    const body = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {})
    store.set(id, body)
    res.status(200).json(body)
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

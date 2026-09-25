import { creditScoreFromQuery } from '../src/lib/creditScore/http.ts'

type ScoreReq = { method?: string; url?: string }
type ScoreRes = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void; end: (chunk?: unknown) => void }
}

function cors(res: ScoreRes) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default function handler(req: ScoreReq, res: ScoreRes) {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const url = new URL(req.url ?? '/api/credit-score', 'http://localhost')
  const result = creditScoreFromQuery(url)
  res.status(result.status).json(result.body)
}

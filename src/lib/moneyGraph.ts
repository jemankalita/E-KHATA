export function cumulativeSeries(opening: number, amounts: number[]): number[] {
  let run = opening
  const series = [opening]
  for (const amount of amounts) {
    run += amount
    series.push(run)
  }
  return series
}

export function densifySeries(values: number[], count: number): number[] {
  if (values.length === 0) return Array.from({ length: count }, () => 0)
  if (values.length === 1) return Array.from({ length: count }, () => values[0])
  if (values.length >= count) return values
  const last = values.length - 1
  return Array.from({ length: count }, (_, index) => {
    const t = (index / (count - 1)) * last
    const i0 = Math.floor(t)
    const i1 = Math.min(i0 + 1, last)
    const f = t - i0
    return values[i0] * (1 - f) + values[i1] * f
  })
}

export function chartStats(values: number[]) {
  const safe = values.length ? values : [0]
  const min = Math.min(...safe)
  const max = Math.max(...safe)
  const mean = safe.reduce((sum, value) => sum + value, 0) / safe.length
  const first = safe[0]
  const last = safe[safe.length - 1]
  return { min, max, mean, first, last, change: last - first }
}

export function compactInr(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}k`
  return `${sign}₹${Math.round(abs)}`
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / exp
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nice * exp
}

export function yTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.12, 20)
    min -= pad
    max += pad
  }
  const step = niceStep((max - min) / Math.max(count - 1, 1))
  const start = Math.floor(min / step) * step
  const ticks: number[] = []
  for (let value = start; value <= max + step / 2; value += step) {
    ticks.push(Math.round(value * 100) / 100)
    if (ticks.length > 8) break
  }
  return ticks
}

export function ledgerSpark(
  opening: number,
  entries: Array<{ amount: number; timestamp: string }>,
): { values: number[]; labels: string[] } {
  const sorted = [...entries].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  if (sorted.length === 0) {
    return { values: [opening], labels: ['Open', 'Now'] }
  }
  const values = cumulativeSeries(
    opening,
    sorted.map((entry) => entry.amount),
  )
  const labels = [
    'Open',
    ...sorted.map((entry) =>
      new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(entry.timestamp)),
    ),
  ]
  return { values, labels }
}

export function sparkPath(values: number[], width: number, height: number, pad = 4): string {
  if (values.length === 0) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min
  const innerW = width - pad * 2
  const innerH = height - pad * 2
  const last = Math.max(values.length - 1, 1)

  return values
    .map((value, index) => {
      const x = pad + (index / last) * innerW
      const y = span === 0 ? height / 2 : pad + innerH - ((value - min) / span) * innerH
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

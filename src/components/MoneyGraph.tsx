import { useId } from 'react'
import { chartStats, compactInr, densifySeries, yTicks } from '@/lib/moneyGraph'
import { formatInr } from '@/lib/utils'

const WIDTH = 640
const HEIGHT = 260
const PAD = { top: 16, right: 16, bottom: 32, left: 52 }

export function MoneyGraph({
  values,
  label,
  labels,
  className,
}: {
  values: number[]
  label: string
  labels?: string[]
  className?: string
}) {
  const fillId = useId().replace(/:/g, '')
  const series = densifySeries(values, Math.max(values.length, 12))
  const stats = chartStats(series)
  const ticks = yTicks(stats.min, stats.max, 4)
  const axisMin = ticks[0] ?? stats.min
  const axisMax = ticks[ticks.length - 1] ?? stats.max
  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const span = axisMax - axisMin || 1
  const points = series.map((value, index) => {
    const x = PAD.left + (index / Math.max(series.length - 1, 1)) * innerW
    const y = PAD.top + innerH - ((value - axisMin) / span) * innerH
    return { x, y }
  })
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ')
  const last = points[points.length - 1] ?? { x: PAD.left, y: HEIGHT / 2 }
  const meanY = PAD.top + innerH - ((stats.mean - axisMin) / span) * innerH
  const area = `${line} L ${last.x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`
  const xLabels = labels?.length ? labels : ['Start', 'Mid', 'Now']
  const shownLabels = [
    { index: 0, text: xLabels[0] },
    { index: 0.5, text: xLabels[Math.floor((xLabels.length - 1) / 2)] },
    { index: 1, text: xLabels[xLabels.length - 1] },
  ]

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => {
          const y = PAD.top + innerH - ((tick - axisMin) / span) * innerH
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y}
                y2={y}
                className="stroke-foreground/15"
                strokeWidth="1"
              />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11">
                {compactInr(tick)}
              </text>
            </g>
          )
        })}
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={meanY}
          y2={meanY}
          className="stroke-foreground/40"
          strokeDasharray="5 5"
          strokeWidth="1.2"
        />
        <path d={area} fill={`url(#${fillId})`} className="text-primary" />
        <path d={line} className="spark" />
        {points.map((point, index) => {
          if (index % Math.ceil(series.length / 8) !== 0 && index !== series.length - 1) return null
          return <circle key={index} cx={point.x} cy={point.y} r="3.2" className="fill-primary" />
        })}
        <circle cx={last.x} cy={last.y} r="4.5" className="fill-foreground" />
        {shownLabels.map((item) => {
          const x = PAD.left + item.index * innerW
          return (
            <text
              key={`${item.text}-${item.index}`}
              x={x}
              y={HEIGHT - 10}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="11"
            >
              {item.text}
            </text>
          )
        })}
      </svg>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
        <Stat label="Peak" value={formatInr(stats.max)} />
        <Stat label="Average" value={formatInr(Math.round(stats.mean))} />
        <Stat label="Low" value={formatInr(stats.min)} />
        <Stat
          label="Net"
          value={`${stats.change >= 0 ? '+' : ''}${formatInr(stats.change)}`}
        />
      </dl>
    </figure>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-foreground/5 px-3 py-2">
      <dt className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  )
}

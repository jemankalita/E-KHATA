import { HERO_PHONE_LEDGER, heroPhoneAriaLabel } from '@/lib/heroPhone'
import { sparkPath } from '@/lib/moneyGraph'
import { motionTokens } from '@/lib/motion-tokens'
import { formatInr } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'
import { Gift, Settings } from 'lucide-react'

const CHART_W = 220
const CHART_H = 92
const DAYS = ['12', '13', '14', '15', '16', '17'] as const

export function HeroPhone() {
  const reduce = useReducedMotion()
  const path = sparkPath([...HERO_PHONE_LEDGER.series], CHART_W, CHART_H)
  const float = motionTokens.duration.crawl * 6

  return (
    <figure
      role="img"
      aria-label={heroPhoneAriaLabel()}
      className="hero-phone-stage mx-auto mt-4 w-full max-w-[420px] lg:mt-0 lg:max-w-none"
    >
      <motion.div
        className="hero-phone relative mx-auto h-[560px] w-[280px] origin-bottom"
        initial={
          reduce
            ? { opacity: 1, rotateX: 6, rotateY: -10, rotateZ: 2 }
            : { opacity: 0, y: 28, rotateX: 10, rotateY: -14, rotateZ: 3 }
        }
        animate={
          reduce
            ? { opacity: 1, rotateX: 6, rotateY: -10, rotateZ: 2 }
            : {
                opacity: 1,
                y: [0, -8, 0],
                rotateX: [6, 8, 6],
                rotateY: [-10, -8, -10],
                rotateZ: [2, 2.6, 2],
              }
        }
        transition={
          reduce
            ? { duration: motionTokens.duration.fast }
            : {
                opacity: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth },
                y: { duration: float, repeat: Infinity, ease: 'easeInOut' },
                rotateX: { duration: float, repeat: Infinity, ease: 'easeInOut' },
                rotateY: { duration: float, repeat: Infinity, ease: 'easeInOut' },
                rotateZ: { duration: float, repeat: Infinity, ease: 'easeInOut' },
              }
        }
      >
        <div className="hero-phone-frame absolute inset-0 rounded-[48px] p-[11px]">
          <div className="relative h-full overflow-hidden rounded-[38px] bg-[#0b0c12] text-white">
            <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
            <PhoneScreen path={path} reduce={Boolean(reduce)} />
          </div>
        </div>
      </motion.div>
    </figure>
  )
}

function PhoneScreen({ path, reduce }: { path: string; reduce: boolean }) {
  return (
    <div className="flex h-full flex-col px-4 pb-5 pt-9">
      <div className="mb-5 flex items-center justify-between">
        <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[11px] font-medium tracking-wide">
          {HERO_PHONE_LEDGER.initials}
        </span>
        <span className="flex gap-2 text-white/70">
          <Gift className="size-4" aria-hidden="true" />
          <Settings className="size-4" aria-hidden="true" />
        </span>
      </div>

      <p className="text-[11px] tracking-[0.14em] text-white/45 uppercase">Outstanding</p>
      <p className="mt-1 flex items-end gap-2 font-display text-[34px] leading-none tabular-nums">
        {formatInr(HERO_PHONE_LEDGER.outstanding)}
        <span className="mb-0.5 text-[12px] font-sans text-[#a3b084]">{HERO_PHONE_LEDGER.growthLabel}</span>
      </p>
      <p className="mt-1 text-[11px] text-white/45">Next settle {HERO_PHONE_LEDGER.nextSettlement}</p>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="mt-4 h-[88px] w-full"
        aria-label="Khata graph"
      >
        <defs>
          <linearGradient id="hero-phone-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d8cbb8" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#d8cbb8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${CHART_W - 4} ${CHART_H} L 4 ${CHART_H} Z`} fill="url(#hero-phone-fill)" />
        <motion.path
          d={path}
          fill="none"
          stroke="#d8cbb8"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="hero-phone-spark"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : motionTokens.duration.crawl, ease: motionTokens.easing.smooth }}
        />
      </svg>

      <div className="mt-3 flex gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px]">Add bill</span>
        <span className="rounded-full bg-white px-3 py-1.5 text-[11px] text-black">Settle</span>
      </div>
      <div className="mt-3 flex gap-2 text-[10px] text-white/35">
        {['1W', '1M', '3M', '6M', '1Y'].map((range, index) => (
          <span key={range} className={index === 1 ? 'text-white' : undefined}>
            {range}
          </span>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {HERO_PHONE_LEDGER.openBills.map((bill) => (
          <li key={bill.merchant} className="flex items-center justify-between rounded-2xl bg-white/6 px-3 py-2">
            <span className="text-[12px] text-white/85">{bill.merchant}</span>
            <span className="text-[12px] tabular-nums text-white/70">{formatInr(bill.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex justify-between rounded-full bg-white/8 px-2 py-1.5">
        {DAYS.map((day, index) => (
          <span
            key={day}
            className={`grid size-7 place-items-center rounded-full text-[11px] ${
              index === 3 ? 'bg-[#d8cbb8] text-[#1a1714]' : 'text-white/45'
            }`}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  )
}

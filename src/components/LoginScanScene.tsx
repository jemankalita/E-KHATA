import { motion, useReducedMotion } from 'motion/react'
import { motionTokens } from '@/lib/motion-tokens'

const SCENE_LABEL = 'Person scanning a shop QR while money flows into e-Khata'
const MONEY_PATH = 'M178 188 C 248 142, 318 140, 400 186'
const FLOW = {
  duration: motionTokens.duration.crawl,
  ease: motionTokens.easing.linear,
  repeat: Infinity,
} as const

function QrFace({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="48" height="48" rx="6" fill="#fffdf8" stroke="#2a241c" strokeWidth="1.1" />
      <rect x="5" y="5" width="13" height="13" rx="1.5" fill="#2a241c" />
      <rect x="30" y="5" width="13" height="13" rx="1.5" fill="#2a241c" />
      <rect x="5" y="30" width="13" height="13" rx="1.5" fill="#2a241c" />
      <rect x="8" y="8" width="7" height="7" rx="1" fill="#fffdf8" />
      <rect x="33" y="8" width="7" height="7" rx="1" fill="#fffdf8" />
      <rect x="8" y="33" width="7" height="7" rx="1" fill="#fffdf8" />
      <rect x="22" y="21" width="5" height="5" fill="#2a241c" />
      <rect x="30" y="28" width="5" height="5" fill="#2a241c" />
      <rect x="21" y="30" width="7" height="3" fill="#2a241c" />
    </g>
  )
}

function RupeeNote() {
  return (
    <g>
      <rect x="-20" y="-11" width="40" height="22" rx="4" fill="#6d52e8" />
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fill="#f7f4ff"
        fontSize="12"
        fontFamily="Fraunces, Times New Roman, serif"
      >
        ₹
      </text>
    </g>
  )
}

export function LoginScanScene() {
  const reduce = useReducedMotion()

  return (
    <figure
      role="img"
      aria-label={SCENE_LABEL}
      className="relative mt-10 overflow-hidden rounded-[28px] bg-white/88 text-zinc-900 shadow-[0_18px_50px_rgba(8,40,90,0.18)] ring-1 ring-white/70 backdrop-blur-md dark:bg-white/10 dark:text-white dark:ring-white/15"
    >
      <svg viewBox="0 0 640 320" className="h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="scene-wash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dff0ff" />
            <stop offset="100%" stopColor="#f7fbff" />
          </linearGradient>
          <linearGradient id="awning" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6d52e8" />
            <stop offset="100%" stopColor="#9b86f0" />
          </linearGradient>
          <linearGradient id="scan-beam" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#6d52e8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6d52e8" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="640" height="320" fill="url(#scene-wash)" />
        <path d="M0 232 L 640 232 L 640 320 L 0 320 Z" fill="#e7eef6" />

        <g>
          <rect x="48" y="86" width="200" height="150" rx="10" fill="#fff8ef" stroke="#d7c8b4" />
          <rect x="62" y="104" width="172" height="78" rx="4" fill="#cfe6f7" />
          <rect x="132" y="182" width="26" height="46" rx="3" fill="#c4b29a" />
          <path d="M40 86 L 256 86 L 242 114 L 54 114 Z" fill="url(#awning)" />
          <rect x="86" y="58" width="124" height="26" rx="6" fill="#6d52e8" />
          <text
            x="148"
            y="76"
            textAnchor="middle"
            fill="#f7f4ff"
            fontSize="13"
            fontFamily="Fraunces, Times New Roman, serif"
          >
            Kirana Stores
          </text>
        </g>

        <g>
          <rect x="122" y="206" width="64" height="8" rx="2" fill="#d7c8b4" />
          <QrFace x={130} y={158} />
        </g>

        <motion.rect
          x="130"
          y="160"
          width="48"
          height="3"
          rx="1.5"
          fill="#6d52e8"
          animate={reduce ? { opacity: 0.7 } : { translateY: [0, 42, 0], opacity: [0.3, 1, 0.3] }}
          transition={reduce ? undefined : { ...FLOW, duration: motionTokens.duration.slow }}
        />

        <g>
          <ellipse cx="500" cy="268" rx="40" ry="8" fill="#c5d0dc" />
          <path d="M480 252 C 476 220, 486 196, 502 182 C 520 196, 530 220, 524 252 Z" fill="#4b5568" />
          <circle cx="502" cy="166" r="15" fill="#f0c8a4" />
          <path d="M488 162 C 492 148, 514 148, 516 164" fill="#2a241c" />
          <path d="M472 208 C 452 198, 434 208, 424 222" fill="none" stroke="#4b5568" strokeWidth="8" strokeLinecap="round" />
          <g transform="rotate(-18 410 206)">
            <rect x="394" y="182" width="28" height="48" rx="6" fill="#111827" />
            <rect x="398" y="187" width="20" height="34" rx="3" fill="#eef4ff" />
            <rect x="401" y="192" width="14" height="8" rx="1" fill="#6d52e8" opacity="0.45" />
          </g>
        </g>

        <motion.polygon
          points="178,184 412,196 412,216 178,202"
          fill="url(#scan-beam)"
          animate={reduce ? { opacity: 0.2 } : { opacity: [0.12, 0.42, 0.12] }}
          transition={reduce ? undefined : { ...FLOW, duration: motionTokens.duration.slow }}
        />

        <path d={MONEY_PATH} fill="none" stroke="#6d52e8" strokeOpacity="0.28" strokeDasharray="3 7" />

        {[0, 0.33, 0.66].map((delay) => (
          <motion.g
            key={delay}
            style={{ offsetPath: `path('${MONEY_PATH}')`, offsetRotate: '0deg' }}
            animate={reduce ? { offsetDistance: `${24 + delay * 40}%` } : { offsetDistance: ['8%', '92%'] }}
            transition={reduce ? undefined : { ...FLOW, delay: delay * motionTokens.duration.crawl }}
          >
            <RupeeNote />
          </motion.g>
        ))}

        <g>
          <rect x="378" y="188" width="74" height="52" rx="10" fill="#ffffff" stroke="#d5deea" />
          <rect x="388" y="198" width="34" height="5" rx="2" fill="#6d52e8" />
          <rect x="388" y="208" width="26" height="3" rx="1.5" fill="#94a3b8" />
          <rect x="388" y="216" width="20" height="3" rx="1.5" fill="#94a3b8" />
          <text x="415" y="254" textAnchor="middle" fontSize="10" fill="#64748b">
            khata
          </text>
        </g>
      </svg>
    </figure>
  )
}

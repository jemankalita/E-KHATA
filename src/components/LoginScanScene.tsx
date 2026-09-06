import { motion, useReducedMotion } from 'motion/react'
import { motionTokens } from '@/lib/motion-tokens'

const SCENE_LABEL = 'Person scanning a shop QR while money flows into e-Khata'
const MONEY_PATH = 'M168 196 C 230 150, 310 146, 392 198'
const FLOW = {
  duration: motionTokens.duration.crawl,
  ease: motionTokens.easing.linear,
  repeat: Infinity,
} as const

function QrFace({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="52" height="52" rx="6" fill="#f7f4ee" stroke="#1c1914" strokeWidth="1.2" />
      <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#1c1914" />
      <rect x="33" y="5" width="14" height="14" rx="1.5" fill="#1c1914" />
      <rect x="5" y="33" width="14" height="14" rx="1.5" fill="#1c1914" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1" fill="#f7f4ee" />
      <rect x="36.5" y="8.5" width="7" height="7" rx="1" fill="#f7f4ee" />
      <rect x="8.5" y="36.5" width="7" height="7" rx="1" fill="#f7f4ee" />
      <rect x="24" y="22" width="6" height="6" fill="#1c1914" />
      <rect x="32" y="30" width="5" height="5" fill="#1c1914" />
      <rect x="22" y="32" width="8" height="3" fill="#1c1914" />
      <rect x="34" y="40" width="10" height="3" fill="#1c1914" />
    </g>
  )
}

function RupeeNote() {
  return (
    <g>
      <rect x="-22" y="-12" width="44" height="24" rx="4" fill="#6d52e8" />
      <rect x="-20" y="-10" width="40" height="20" rx="3" fill="#cbb7ff" opacity="0.35" />
      <circle cx="-11" cy="0" r="5" fill="#f7f4ff" opacity="0.45" />
      <text
        x="4"
        y="5"
        textAnchor="middle"
        fill="#1a122c"
        fontSize="13"
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
      className="relative mt-10 overflow-hidden rounded-[28px] bg-[#1a1410]/80 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm dark:bg-[#16120f]/90"
    >
      <svg viewBox="0 0 640 360" className="h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="shop-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2018" />
            <stop offset="100%" stopColor="#14100c" />
          </linearGradient>
          <linearGradient id="awning" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6d52e8" />
            <stop offset="100%" stopColor="#cbb7ff" />
          </linearGradient>
          <linearGradient id="scan-beam" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#cbb7ff" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#cbb7ff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#cbb7ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lamp" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#f4e0b0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f4e0b0" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="640" height="360" fill="url(#shop-sky)" />
        <ellipse cx="168" cy="78" rx="90" ry="50" fill="url(#lamp)" />

        <path d="M0 248 L 640 248 L 640 360 L 0 360 Z" fill="#2a241c" />
        <path d="M0 248 L 640 248 L 640 262 L 0 268 Z" fill="#3a3228" />

        <g>
          <rect x="36" y="88" width="220" height="168" rx="6" fill="#2d241c" />
          <rect x="48" y="104" width="196" height="92" rx="3" fill="#9ec7e8" opacity="0.28" />
          <rect x="48" y="104" width="196" height="92" rx="3" fill="none" stroke="#d8c4a0" strokeWidth="3" />
          <rect x="142" y="196" width="28" height="52" rx="2" fill="#1c1610" />
          <circle cx="164" cy="224" r="2.2" fill="#cbb7ff" />

          <path d="M28 88 L 264 88 L 248 118 L 44 118 Z" fill="url(#awning)" />
          <path d="M44 118 L 56 128 L 68 118 L 80 128 L 92 118 L 104 128 L 116 118 L 128 128 L 140 118 L 152 128 L 164 118 L 176 128 L 188 118 L 200 128 L 212 118 L 224 128 L 236 118 L 248 128 L 248 118" fill="#1a122c" opacity="0.25" />

          <rect x="78" y="58" width="136" height="28" rx="4" fill="#111010" />
          <text x="146" y="77" textAnchor="middle" fill="#f4efe6" fontSize="13" fontFamily="Fraunces, Times New Roman, serif">
            Sharma Stores
          </text>
        </g>

        <g>
          <rect x="118" y="214" width="68" height="10" rx="2" fill="#3f3428" />
          <rect x="140" y="196" width="24" height="20" rx="2" fill="#f3efe6" />
          <QrFace x={126} y={168} />
        </g>

        <motion.rect
          x="126"
          y="170"
          width="52"
          height="3"
          rx="1.5"
          fill="#cbb7ff"
          animate={reduce ? { opacity: 0.7 } : { translateY: [0, 46, 0], opacity: [0.25, 1, 0.25] }}
          transition={reduce ? undefined : { ...FLOW, duration: motionTokens.duration.slow }}
        />

        <g>
          <ellipse cx="508" cy="286" rx="46" ry="10" fill="#111010" opacity="0.45" />
          <path d="M486 268 C 480 230, 490 204, 510 188 C 532 204, 542 232, 534 268 Z" fill="#2b3340" />
          <path d="M494 248 C 500 232, 520 230, 528 248" fill="#3d4654" />
          <circle cx="510" cy="170" r="16" fill="#f0d2b0" />
          <path d="M494 166 C 498 150, 524 150, 526 168" fill="#1c1914" />
          <path d="M478 214 C 456 204, 438 214, 428 230" fill="none" stroke="#2b3340" strokeWidth="9" strokeLinecap="round" />
          <g transform="rotate(-22 412 214)">
            <rect x="392" y="188" width="30" height="52" rx="7" fill="#111111" />
            <rect x="396" y="193" width="22" height="38" rx="3" fill="#1d2a44" />
            <rect x="400" y="198" width="14" height="10" rx="1" fill="#cbb7ff" opacity="0.55" />
            <circle cx="407" cy="226" r="3" fill="#8fb84a" />
          </g>
        </g>

        <motion.polygon
          points="178,194 404,206 404,230 178,214"
          fill="url(#scan-beam)"
          animate={reduce ? { opacity: 0.2 } : { opacity: [0.1, 0.5, 0.1] }}
          transition={reduce ? undefined : { ...FLOW, duration: motionTokens.duration.slow }}
        />

        <path d={MONEY_PATH} fill="none" stroke="#cbb7ff" strokeOpacity="0.28" strokeDasharray="3 7" />

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
          <rect x="368" y="196" width="78" height="58" rx="10" fill="#111111" />
          <rect x="376" y="204" width="62" height="36" rx="5" fill="#1b1524" />
          <rect x="382" y="212" width="36" height="5" rx="2" fill="#cbb7ff" />
          <rect x="382" y="222" width="28" height="3" rx="1.5" fill="#8e8e93" />
          <rect x="382" y="229" width="20" height="3" rx="1.5" fill="#8e8e93" />
          <text x="407" y="268" textAnchor="middle" fontSize="10" fill="#c9c2b6">
            khata
          </text>
        </g>
      </svg>
    </figure>
  )
}

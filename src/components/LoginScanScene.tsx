import { motion, useReducedMotion } from 'motion/react'
import { motionTokens } from '@/lib/motion-tokens'

const SCENE_LABEL = 'Person scanning a shop QR while money flows into e-Khata'
const MONEY_PATH = 'M142 156 C 196 108, 268 108, 332 168'
const FLOW = {
  duration: motionTokens.duration.crawl,
  ease: motionTokens.easing.linear,
  repeat: Infinity,
} as const

function QrFace({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="56" height="56" rx="8" fill="var(--card)" stroke="var(--border)" />
      <rect x="6" y="6" width="15" height="15" rx="2" fill="currentColor" />
      <rect x="35" y="6" width="15" height="15" rx="2" fill="currentColor" />
      <rect x="6" y="35" width="15" height="15" rx="2" fill="currentColor" />
      <rect x="10" y="10" width="7" height="7" rx="1" fill="var(--card)" />
      <rect x="39" y="10" width="7" height="7" rx="1" fill="var(--card)" />
      <rect x="10" y="39" width="7" height="7" rx="1" fill="var(--card)" />
      <rect x="30" y="30" width="7" height="7" fill="currentColor" />
      <rect x="40" y="40" width="10" height="4" fill="currentColor" />
      <rect x="30" y="42" width="4" height="8" fill="currentColor" />
    </g>
  )
}

function RupeeNote() {
  return (
    <g>
      <rect x="-20" y="-11" width="40" height="22" rx="5" fill="var(--primary)" />
      <rect x="-16" y="-7" width="8" height="8" rx="4" fill="var(--primary-foreground)" opacity="0.28" />
      <text
        x="2"
        y="5"
        textAnchor="middle"
        fill="var(--primary-foreground)"
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
      className="relative mt-10 overflow-hidden rounded-[28px] bg-card text-foreground shadow-[inset_0_0_0_1px_var(--border)]"
    >
      <svg viewBox="0 0 520 280" className="h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="scan-beam" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.7" />
            <stop offset="70%" stopColor="var(--primary)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M0 232 C 90 208, 210 248, 330 220 C 410 202, 470 230, 520 218 L 520 280 L 0 280 Z"
          fill="var(--muted)"
          opacity="0.5"
        />

        <g>
          <rect x="36" y="72" width="148" height="136" rx="22" fill="var(--secondary)" />
          <rect x="50" y="86" width="120" height="20" rx="8" fill="var(--muted)" />
          <text x="110" y="100" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
            Sharma Stores
          </text>
          <QrFace x="82" y="120" />
        </g>

        <motion.rect
          x="82"
          y="122"
          width="56"
          height="4"
          rx="2"
          fill="var(--primary)"
          animate={reduce ? { opacity: 0.7 } : { translateY: [0, 48, 0], opacity: [0.35, 1, 0.35] }}
          transition={reduce ? undefined : { ...FLOW, duration: motionTokens.duration.slow }}
        />

        <g>
          <ellipse cx="418" cy="232" rx="42" ry="9" fill="var(--muted)" />
          <path d="M392 216 C 386 170, 398 138, 418 122 C 438 138, 450 170, 444 216 Z" fill="var(--secondary)" />
          <circle cx="418" cy="102" r="17" fill="var(--foreground)" />
          <path d="M404 168 C 392 154, 378 150, 364 158" fill="none" stroke="var(--secondary)" strokeWidth="10" strokeLinecap="round" />
          <rect x="348" y="132" width="26" height="44" rx="6" fill="var(--foreground)" transform="rotate(-18 361 154)" />
          <rect x="352" y="138" width="18" height="28" rx="3" fill="var(--primary)" transform="rotate(-18 361 152)" />
        </g>

        <motion.polygon
          points="138,148 356,150 356,176 138,168"
          fill="url(#scan-beam)"
          animate={reduce ? { opacity: 0.22 } : { opacity: [0.12, 0.55, 0.12] }}
          transition={reduce ? undefined : { ...FLOW, duration: motionTokens.duration.slow }}
        />

        <path d={MONEY_PATH} fill="none" stroke="var(--primary)" strokeOpacity="0.22" strokeDasharray="4 8" />

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
          <rect x="304" y="168" width="72" height="52" rx="10" fill="var(--foreground)" />
          <rect x="314" y="178" width="52" height="6" rx="3" fill="var(--primary)" />
          <rect x="314" y="190" width="40" height="4" rx="2" fill="var(--muted)" />
          <rect x="314" y="200" width="28" height="4" rx="2" fill="var(--muted)" />
          <text x="340" y="232" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
            khata
          </text>
        </g>
      </svg>
    </figure>
  )
}

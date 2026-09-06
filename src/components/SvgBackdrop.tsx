import { cn } from '../lib/cn'

/** Static paper texture: fine grid, warm wash, one ink wave. */
export function SvgBackdrop({ className }: { className?: string }) {
  return (
    <svg className={cn('pointer-events-none fixed inset-0 -z-10 h-full w-full', className)} aria-hidden="true">
      <defs>
        <pattern id="ekhata-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="rgba(28,28,25,0.05)" strokeWidth="1" />
        </pattern>
        <radialGradient id="ekhata-wash" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="rgba(11,106,99,0.10)" />
          <stop offset="42%" stopColor="rgba(243,241,234,0)" />
        </radialGradient>
        <linearGradient id="ekhata-wave" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(122,95,36,0.06)" />
          <stop offset="100%" stopColor="rgba(11,106,99,0.05)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="#f3f1ea" />
      <rect width="100%" height="100%" fill="url(#ekhata-grid)" />
      <rect width="100%" height="100%" fill="url(#ekhata-wash)" />
      <path
        d="M0,520 C180,460 260,620 480,560 C700,500 760,640 1100,560 C1300,510 1400,600 1600,540 L1600,900 L0,900 Z"
        fill="url(#ekhata-wave)"
        opacity="0.9"
      />
    </svg>
  )
}

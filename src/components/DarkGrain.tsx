import { useTheme } from '@/hooks/useTheme'
import { grainVisibleOnPath } from '@/lib/grainVisibility'
import { useLocation } from 'react-router-dom'

export function DarkGrain() {
  const { theme } = useTheme()
  const { pathname } = useLocation()
  if (!grainVisibleOnPath(pathname)) return null

  return (
    <div
      data-testid="dark-grain"
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[60] ${
        theme === 'light' ? 'mix-blend-multiply opacity-55' : 'mix-blend-overlay'
      }`}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter
          id="ekhata-dark-grain"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="4" stitchTiles="stitch" result="n" />
          <feColorMatrix type="saturate" values="0" in="n" result="g" />
          <feComponentTransfer in="g">
            <feFuncR type="linear" slope="2.6" intercept="-0.8" />
            <feFuncG type="linear" slope="2.6" intercept="-0.8" />
            <feFuncB type="linear" slope="2.6" intercept="-0.8" />
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#ekhata-dark-grain)" />
      </svg>
    </div>
  )
}

import { useTheme } from '@/hooks/useTheme'
import { landingVideoSrc } from '@/lib/landingVideo'

export function LandingVideoBackdrop() {
  const { theme } = useTheme()
  const src = landingVideoSrc(theme)

  return (
    <div
      data-testid="landing-video-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <video
        key={src}
        className="h-full w-full object-cover"
        src={src}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className={theme === 'light' ? 'absolute inset-0 bg-white/50' : 'absolute inset-0 bg-black/45'} />
    </div>
  )
}

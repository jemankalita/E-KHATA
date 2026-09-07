import type { Theme } from '@/hooks/useTheme'

export const LANDING_NIGHT_VIDEO = '/backgrounds/landing-night.mp4'
export const LANDING_DAY_VIDEO = '/backgrounds/landing-day.mp4'

export function landingVideoSrc(theme: Theme): string {
  return theme === 'light' ? LANDING_DAY_VIDEO : LANDING_NIGHT_VIDEO
}

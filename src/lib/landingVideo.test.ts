import { describe, expect, it } from 'vitest'
import { LANDING_DAY_VIDEO, LANDING_NIGHT_VIDEO, landingVideoSrc } from './landingVideo'

describe('landingVideoSrc', () => {
  it('uses the night background in dark mode', () => {
    expect(landingVideoSrc('dark')).toBe(LANDING_NIGHT_VIDEO)
    expect(LANDING_NIGHT_VIDEO).toBe('/backgrounds/landing-night.mp4')
  })

  it('uses the day background in light mode', () => {
    expect(landingVideoSrc('light')).toBe(LANDING_DAY_VIDEO)
    expect(LANDING_DAY_VIDEO).toBe('/backgrounds/landing-day.mp4')
  })
})

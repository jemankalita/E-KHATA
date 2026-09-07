import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LandingVideoBackdrop } from './LandingVideoBackdrop'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

describe('LandingVideoBackdrop', () => {
  it('plays the day video in light mode', () => {
    render(<LandingVideoBackdrop />)
    const video = screen.getByTestId('landing-video-backdrop').querySelector('video')
    expect(video).toHaveAttribute('src', '/backgrounds/landing-day.mp4')
  })
})

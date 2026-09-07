import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DarkGrain } from './DarkGrain'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

describe('DarkGrain', () => {
  it('renders a non-interactive grain overlay in dark mode', () => {
    render(<DarkGrain />)
    const grain = screen.getByTestId('dark-grain')
    expect(grain).toHaveAttribute('aria-hidden', 'true')
    expect(grain).toHaveClass('pointer-events-none')
  })
})

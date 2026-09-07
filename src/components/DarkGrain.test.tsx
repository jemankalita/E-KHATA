import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
    render(
      <MemoryRouter>
        <DarkGrain />
      </MemoryRouter>,
    )
    const grain = screen.getByTestId('dark-grain')
    expect(grain).toHaveAttribute('aria-hidden', 'true')
    expect(grain).toHaveClass('pointer-events-none')
  })

  it('hides grain on the QR scan camera', () => {
    render(
      <MemoryRouter initialEntries={['/customer/scan']}>
        <DarkGrain />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('dark-grain')).not.toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DarkGrain } from './DarkGrain'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

describe('DarkGrain in light mode', () => {
  it('renders a grain overlay on account pages', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <DarkGrain />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('dark-grain')).toBeInTheDocument()
  })

  it('hides grain on the QR scan camera', () => {
    render(
      <MemoryRouter initialEntries={['/customer/scan?mode=qr']}>
        <DarkGrain />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('dark-grain')).not.toBeInTheDocument()
  })
})

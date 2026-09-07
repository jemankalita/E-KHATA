import { render, screen } from '@testing-library/react'
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
  it('does not render a grain overlay', () => {
    render(<DarkGrain />)
    expect(screen.queryByTestId('dark-grain')).not.toBeInTheDocument()
  })
})

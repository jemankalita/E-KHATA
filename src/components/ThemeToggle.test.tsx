import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

describe('ThemeToggle', () => {
  it('keeps Light and Dark labels off the compact control so the switch can sit beside a logo', () => {
    render(<ThemeToggle />)

    const light = screen.getByTestId('theme-light')
    const dark = screen.getByTestId('theme-dark')

    expect(light).toHaveAttribute('aria-label', 'Light')
    expect(dark).toHaveAttribute('aria-label', 'Dark')
    expect(light.querySelector('[data-theme-label]')).toHaveClass('hidden', 'sm:inline')
    expect(dark.querySelector('[data-theme-label]')).toHaveClass('hidden', 'sm:inline')
  })
})

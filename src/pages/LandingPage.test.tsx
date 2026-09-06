import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    setRole: vi.fn(),
    resetDemo: vi.fn(),
  }),
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

describe('LoginPage', () => {
  it('offers two account paths without customer scan or month-end settlement copy', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /trust captured/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue as\s*customer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue as\s*shopkeeper/i })).toBeInTheDocument()
    expect(screen.queryByText(/month end/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/scan/i)).not.toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SiteHeader } from './Navbar'

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    role: 'customer',
    state: {
      merchant: { name: 'Sharma Stores' },
      customer: { name: 'Rahul Sharma' },
    },
  }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: { displayName: 'Rahul Sharma' },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

describe('SiteHeader', () => {
  it('sends the e-Khata brand to the login page', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <SiteHeader />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /e-khata/i })).toHaveAttribute('href', '/login')
  })
})

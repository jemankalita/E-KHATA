import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ShopkeeperDashboardPage } from './ShopkeeperDashboardPage'

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    state: {
      merchant: { name: 'Sharma Stores', outstanding: 18420, activeCustomers: 32, pendingConfirmations: 4 },
      shopkeeperRecent: [
        { id: 'a', customerName: 'Rahul Sharma', amount: 386, status: 'verified' },
        { id: 'b', customerName: 'Aman Verma', amount: 240, status: 'verified' },
      ],
    },
  }),
}))

describe('ShopkeeperDashboardPage', () => {
  it('shows a money graph of outstanding entries', () => {
    render(
      <MemoryRouter>
        <ShopkeeperDashboardPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('img', { name: /outstanding over recent entries/i })).toBeInTheDocument()
    expect(screen.getByText(/average/i)).toBeInTheDocument()
    expect(screen.getByText(/total outstanding/i)).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ShopkeeperDashboardPage } from './ShopkeeperDashboardPage'

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    state: {
      merchant: { name: 'Sharma Stores', outstanding: 18420, activeCustomers: 32, pendingConfirmations: 4 },
      notices: [
        {
          id: 'n1',
          kind: 'settled',
          customerName: 'Aman Verma',
          merchant: 'Sharma Stores',
          amount: 240,
          settledAt: '2026-09-07T12:00:00.000Z',
          seen: false,
        },
      ],
      transactions: [
        {
          id: 'a',
          customerName: 'Rahul Sharma',
          merchant: 'Sharma Stores',
          amount: 386,
          settled: false,
          payBy: '2026-09-30T18:00:00.000Z',
        },
        {
          id: 'b',
          customerName: 'Aman Verma',
          merchant: 'Sharma Stores',
          amount: 240,
          settled: false,
          payBy: '2026-09-15T18:00:00.000Z',
        },
      ],
    },
  }),
}))

describe('ShopkeeperDashboardPage', () => {
  it('lists each customer balance without a ledger chart', () => {
    render(
      <MemoryRouter>
        <ShopkeeperDashboardPage />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('img', { name: /outstanding over recent entries/i })).not.toBeInTheDocument()
    expect(screen.getByText(/who still has to pay/i)).toBeInTheDocument()
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument()
    expect(screen.getByText('Aman Verma')).toBeInTheDocument()
    expect(screen.getByText(/aman verma settled/i)).toBeInTheDocument()
  })
})

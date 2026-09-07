import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DEMO_RFID_UID } from '@/lib/rfid'
import { CustomerDashboardPage } from './CustomerDashboardPage'

const addRfidFare = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    addRfidFare,
    state: {
      customer: { name: 'Rahul Sharma' },
      wallet: { outstanding: 1240, nextSettlement: '30 September 2026', carriedForward: 0 },
      transactions: [],
      notices: [],
    },
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function renderDashboard() {
  return render(
    <MemoryRouter>
      <CustomerDashboardPage />
    </MemoryRouter>,
  )
}

describe('CustomerDashboardPage RFID', () => {
  it('starts listening for RFID automatically', () => {
    renderDashboard()
    expect(screen.getByText(/listening for rfid/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /simulate a bus tap/i })).not.toBeInTheDocument()
  })

  it('shows what to pay instead of a ledger chart', () => {
    renderDashboard()
    expect(screen.queryByRole('img', { name: /outstanding over recent entries/i })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /to pay/i })).toBeInTheDocument()
    expect(screen.getByText(/due 30 september 2026/i)).toBeInTheDocument()
  })

  it('posts the fare when a known card is recognized', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await user.keyboard(`${DEMO_RFID_UID}{Enter}`)
    expect(addRfidFare).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: DEMO_RFID_UID,
        merchant: 'Bus Route 21G',
        amount: 20,
      }),
    )
  })
})

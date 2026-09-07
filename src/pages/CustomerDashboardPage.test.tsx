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
      wallet: { outstanding: 1240, nextSettlement: '30 September 2026', carriedForward: 0 },
      transactions: [],
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

  it('shows a money graph of outstanding entries', () => {
    renderDashboard()
    expect(screen.getByRole('img', { name: /outstanding over recent entries/i })).toBeInTheDocument()
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

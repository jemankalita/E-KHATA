import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_RFID_UID } from '@/lib/rfid'
import { CustomerDashboardPage } from './CustomerDashboardPage'
import { unlockVoicePlayback } from '@/lib/voice'

const addRfidFare = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    addRfidFare,
    state: {
      customer: { name: 'Rahul Sharma' },
      wallet: { outstanding: 1240, nextSettlement: '30 September 2026', carriedForward: 754 },
      transactions: [
        {
          id: 'qr',
          customerName: 'Rahul Sharma',
          merchant: 'Sharma Stores',
          amount: 466,
          source: 'QR',
          settled: false,
          timestamp: '2026-09-06T08:14:00.000Z',
        },
        {
          id: 'rfid',
          customerName: 'Rahul Sharma',
          merchant: 'Bus Route 21G',
          amount: 20,
          source: 'RFID',
          settled: false,
          timestamp: '2026-09-06T10:05:00.000Z',
        },
      ],
      notices: [],
    },
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/voice', () => ({
  unlockVoicePlayback: vi.fn(),
}))

function renderDashboard() {
  return render(
    <MemoryRouter>
      <CustomerDashboardPage />
    </MemoryRouter>,
  )
}

describe('CustomerDashboardPage RFID', () => {
  beforeEach(() => {
    vi.mocked(unlockVoicePlayback).mockClear()
  })

  it('unlocks Hindi voice before opening the in-page QR scanner', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await user.click(screen.getByRole('button', { name: /scan a qr bill/i }))
    expect(unlockVoicePlayback).toHaveBeenCalled()
  })

  it('starts listening for RFID automatically', () => {
    renderDashboard()
    expect(screen.getByText(/listening for rfid/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /simulate a bus tap/i })).not.toBeInTheDocument()
  })

  it('shows the outstanding graph and RFID split', () => {
    renderDashboard()
    expect(screen.getByRole('img', { name: /outstanding over recent entries/i })).toBeInTheDocument()
    expect(screen.getByText(/qr khata/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /scan a pack/i })).toBeInTheDocument()
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

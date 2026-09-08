import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomerSettlementPage } from './CustomerSettlementPage'

const settleStore = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    settleStore,
    state: {
      customer: { name: 'Rahul Sharma' },
      wallet: { outstanding: 386 },
      settlement: { dateLabel: '30 September 2026' },
      transactions: [
        {
          id: 'qr',
          customerName: 'Rahul Sharma',
          merchant: 'Sharma Stores',
          amount: 386,
          settled: false,
          payBy: '2026-09-30T00:00:00.000Z',
        },
      ],
    },
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

describe('CustomerSettlementPage demo checkout', () => {
  beforeEach(() => {
    settleStore.mockReset()
  })

  it('clears the shop only after the test payment is completed', async () => {
    const user = userEvent.setup()
    render(<CustomerSettlementPage />)

    await user.click(screen.getByRole('button', { name: /pay & settle sharma stores/i }))
    expect(await screen.findByRole('heading', { name: /test razorpay checkout/i })).toBeInTheDocument()
    expect(settleStore).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /complete test payment/i }))
    expect(settleStore).toHaveBeenCalledWith('Sharma Stores')
  })

  it('keeps the shop open if the test checkout is cancelled', async () => {
    const user = userEvent.setup()
    render(<CustomerSettlementPage />)

    await user.click(screen.getByRole('button', { name: /pay & settle sharma stores/i }))
    await user.click(await screen.findByRole('button', { name: /cancel/i }))

    expect(settleStore).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: /test razorpay checkout/i })).not.toBeInTheDocument()
  })
})

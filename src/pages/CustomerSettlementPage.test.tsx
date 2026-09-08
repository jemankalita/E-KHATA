import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomerSettlementPage } from './CustomerSettlementPage'

const settleStore = vi.hoisted(() => vi.fn())
const openSettlementCheckout = vi.hoisted(() => vi.fn())

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

vi.mock('@/lib/razorpayCheckout', () => ({
  openSettlementCheckout,
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

describe('CustomerSettlementPage payment', () => {
  beforeEach(() => {
    settleStore.mockReset()
    openSettlementCheckout.mockReset()
  })

  it('does not clear the shop until Razorpay reports a paid settlement', async () => {
    let finishPay!: (value: { status: 'paid'; provider: 'razorpay'; paymentId: string }) => void
    openSettlementCheckout.mockReturnValue(
      new Promise((resolve) => {
        finishPay = resolve
      }),
    )

    const user = userEvent.setup()
    render(<CustomerSettlementPage />)
    await user.click(screen.getByRole('button', { name: /pay & settle sharma stores/i }))

    expect(openSettlementCheckout).toHaveBeenCalled()
    expect(settleStore).not.toHaveBeenCalled()

    finishPay({ status: 'paid', provider: 'razorpay', paymentId: 'pay_test_123' })
    expect(await screen.findByRole('button', { name: /pay & settle sharma stores/i })).toBeEnabled()
    expect(settleStore).toHaveBeenCalledWith('Sharma Stores')
  })

  it('leaves the khata open when checkout is cancelled', async () => {
    openSettlementCheckout.mockResolvedValue({ status: 'cancelled' })

    const user = userEvent.setup()
    render(<CustomerSettlementPage />)
    await user.click(screen.getByRole('button', { name: /pay & settle sharma stores/i }))

    expect(await screen.findByRole('button', { name: /pay & settle sharma stores/i })).toBeEnabled()
    expect(settleStore).not.toHaveBeenCalled()
  })
})

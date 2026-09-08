import { describe, expect, it, vi } from 'vitest'
import { openSettlementCheckout } from './razorpayCheckout'
import { buildSettlementPayment } from './settlementPayment'

const request = buildSettlementPayment({
  merchant: 'Sharma Stores',
  customerName: 'Rahul Sharma',
  amountInr: 386,
})

describe('openSettlementCheckout', () => {
  it('opens Razorpay and returns the payment id on success', async () => {
    const open = vi.fn()
    let openedWith: { key: string; amount: number; currency: string; name: string; description: string } | undefined
    class Razorpay {
      constructor(options: {
        key: string
        amount: number
        currency: string
        name: string
        description: string
        handler: (payload: { razorpay_payment_id: string }) => void
      }) {
        openedWith = options
        queueMicrotask(() => options.handler({ razorpay_payment_id: 'pay_test_123' }))
      }
      open = open
      on = vi.fn()
    }

    await expect(
      openSettlementCheckout(request, {
        key: 'rzp_test_demo',
        loadScript: async () => undefined,
        Razorpay,
      }),
    ).resolves.toEqual({ status: 'paid', provider: 'razorpay', paymentId: 'pay_test_123' })

    expect(openedWith).toMatchObject({
      key: 'rzp_test_demo',
      amount: 38600,
      currency: 'INR',
      name: 'E-Khata',
      description: 'Settle Sharma Stores on E-Khata',
    })
    expect(open).toHaveBeenCalled()
  })

  it('returns cancelled when the checkout is dismissed', async () => {
    class Razorpay {
      constructor(options: { modal: { ondismiss: () => void } }) {
        queueMicrotask(() => options.modal.ondismiss())
      }
      open = vi.fn()
      on = vi.fn()
    }

    await expect(
      openSettlementCheckout(request, {
        key: 'rzp_test_demo',
        loadScript: async () => undefined,
        Razorpay,
      }),
    ).resolves.toEqual({ status: 'cancelled' })
  })

  it('uses the demo checkout when no Razorpay key is configured', async () => {
    const openDemoCheckout = vi.fn().mockResolvedValue({
      status: 'paid',
      provider: 'razorpay',
      paymentId: 'pay_demo_1',
    })

    await expect(
      openSettlementCheckout(request, { key: '', openDemoCheckout }),
    ).resolves.toEqual({ status: 'paid', provider: 'razorpay', paymentId: 'pay_demo_1' })

    expect(openDemoCheckout).toHaveBeenCalledWith(request)
  })
})

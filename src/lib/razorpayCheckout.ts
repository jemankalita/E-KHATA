import { resolveRazorpayKey } from './runtimeConfig'
import type { SettlementPaymentRequest } from './settlementPayment'

export const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

export type SettlementPaymentOutcome =
  | { status: 'paid'; provider: 'razorpay'; paymentId: string }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string }

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  prefill?: { name?: string }
  notes?: Record<string, string>
  handler: (response: RazorpaySuccessResponse) => void
  modal: { ondismiss: () => void }
}

export interface RazorpayCheckoutInstance {
  open: () => void
  on: (event: string, handler: (payload: { error?: { description?: string } }) => void) => void
}

export type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance

export interface SettlementCheckoutDeps {
  key?: string
  loadScript?: () => Promise<void>
  Razorpay?: RazorpayConstructor
  openDemoCheckout?: (request: SettlementPaymentRequest) => Promise<SettlementPaymentOutcome>
}

export function razorpayKeyFromEnv(env: { VITE_RAZORPAY_KEY_ID?: string } = import.meta.env): string {
  return resolveRazorpayKey(env)
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout needs a browser.'))
  }
  if (window.Razorpay) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Razorpay.')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Razorpay.'))
    document.body.appendChild(script)
  })
}

export async function openSettlementCheckout(
  request: SettlementPaymentRequest,
  deps: SettlementCheckoutDeps = {},
): Promise<SettlementPaymentOutcome> {
  const key = deps.key ?? razorpayKeyFromEnv()
  if (!key) {
    if (!deps.openDemoCheckout) {
      return { status: 'failed', message: 'Razorpay is not configured.' }
    }
    return deps.openDemoCheckout(request)
  }

  try {
    await (deps.loadScript ?? loadRazorpayScript)()
  } catch (error) {
    return {
      status: 'failed',
      message: error instanceof Error ? error.message : 'Could not load Razorpay.',
    }
  }

  const Checkout = deps.Razorpay ?? window.Razorpay
  if (!Checkout) {
    return { status: 'failed', message: 'Could not start Razorpay checkout.' }
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (outcome: SettlementPaymentOutcome) => {
      if (settled) return
      settled = true
      resolve(outcome)
    }

    try {
      const checkout = new Checkout({
        key,
        amount: request.amountPaise,
        currency: request.currency,
        name: 'E-Khata',
        description: request.description,
        prefill: { name: request.customerName },
        notes: request.notes,
        handler: (response) => {
          finish({
            status: 'paid',
            provider: 'razorpay',
            paymentId: response.razorpay_payment_id,
          })
        },
        modal: {
          ondismiss: () => finish({ status: 'cancelled' }),
        },
      })

      checkout.on('payment.failed', (payload) => {
        finish({
          status: 'failed',
          message: payload.error?.description ?? 'Payment failed.',
        })
      })
      checkout.open()
    } catch (error) {
      finish({
        status: 'failed',
        message: error instanceof Error ? error.message : 'Could not start Razorpay checkout.',
      })
    }
  })
}

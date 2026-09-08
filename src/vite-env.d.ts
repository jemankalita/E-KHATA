/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_RAZORPAY_KEY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface NDEFReadingEvent extends Event {
  serialNumber?: string
}

interface NDEFReader {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>
  addEventListener: (type: 'reading' | 'readingerror', listener: (event: NDEFReadingEvent) => void) => void
  removeEventListener: (type: 'reading' | 'readingerror', listener: (event: NDEFReadingEvent) => void) => void
}

interface Window {
  NDEFReader?: new () => NDEFReader
  Razorpay?: new (options: {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    prefill?: { name?: string }
    notes?: Record<string, string>
    handler: (response: { razorpay_payment_id: string }) => void
    modal: { ondismiss: () => void }
  }) => {
    open: () => void
    on: (event: string, handler: (payload: { error?: { description?: string } }) => void) => void
  }
}

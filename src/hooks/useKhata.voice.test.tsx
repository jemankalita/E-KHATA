import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY } from '@/data/demo'
import type { PendingQr } from '@/types'
import { KhataProvider, useKhata } from './useKhata'

const playConfirmation = vi.hoisted(() => vi.fn(() => Promise.resolve('elevenlabs' as const)))

vi.mock('@/lib/voice', () => ({
  playConfirmation,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: null,
    loading: false,
    session: null,
    configured: false,
  }),
}))

vi.mock('@/lib/liveQr', () => ({
  publishLiveQr: vi.fn(() => Promise.resolve()),
}))

const bill: PendingQr = {
  id: 'EK-2026-000399',
  merchant: 'Sharma Stores',
  customerName: 'Rahul Sharma',
  items: [{ name: 'Milk', quantity: 1, price: 32 }],
  amount: 77,
  category: 'Groceries',
  status: 'waiting',
  payBy: '',
}

function wrapper({ children }: { children: ReactNode }) {
  return <KhataProvider>{children}</KhataProvider>
}

describe('applyScannedQr voice', () => {
  beforeEach(() => {
    localStorage.clear()
    playConfirmation.mockClear()
  })

  it('speaks ElevenLabs confirmation when a customer posts a scanned QR bill', () => {
    const { result } = renderHook(() => useKhata(), { wrapper })

    let posted = null as ReturnType<typeof result.current.applyScannedQr>
    act(() => {
      posted = result.current.applyScannedQr(bill)
    })

    expect(posted?.amount).toBe(77)
    expect(playConfirmation).toHaveBeenCalledWith(77, false)
    localStorage.removeItem(STORAGE_KEY)
  })
})

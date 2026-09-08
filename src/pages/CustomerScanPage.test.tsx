import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomerScanPage } from './CustomerScanPage'

const applyScannedQr = vi.hoisted(() => vi.fn())
const addRfidFare = vi.hoisted(() => vi.fn())
const toastSuccess = vi.hoisted(() => vi.fn())
const toastError = vi.hoisted(() => vi.fn())
const unlockVoicePlayback = vi.hoisted(() => vi.fn())
let lastOnRead: ((value: string) => void) | undefined

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    applyScannedQr,
    addRfidFare,
    markCustomerScanned: vi.fn(),
    state: {
      wallet: { outstanding: 1240 },
      customer: { name: 'Rahul Sharma' },
      merchant: { name: 'Sharma Stores' },
      nextSequence: 410,
    },
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: toastSuccess, error: toastError },
}))

vi.mock('@/lib/voice', () => ({
  unlockVoicePlayback,
}))

vi.mock('@/lib/liveQr', () => ({
  publishLiveQr: vi.fn(),
}))

vi.mock('@/components/CameraPackReader', () => ({
  CameraPackReader: ({ onRead }: { onRead: (value: string) => void }) => {
    lastOnRead = onRead
    return (
      <button type="button" onClick={() => onRead('AMUL TAAZA TONED MILK 500ml')}>
        Simulate pack scan
      </button>
    )
  },
}))

vi.mock('@/components/CameraQrReader', () => ({
  CameraQrReader: ({ onRead }: { onRead: (value: string) => void }) => {
    lastOnRead = onRead
    return (
      <button
        type="button"
        onClick={() =>
          onRead(
            'https://e-khata.example/pay?ref=EK-2026-000399&m=Sharma%20Stores&c=Rahul&a=77&cat=Groceries&i=Milk~1~32_Bread~1~45',
          )
        }
      >
        Simulate bill QR
      </button>
    )
  },
}))

function renderScan() {
  return render(
    <MemoryRouter>
      <CustomerScanPage />
    </MemoryRouter>,
  )
}

describe('CustomerScanPage auto wallet', () => {
  beforeEach(() => {
    applyScannedQr.mockReset()
    addRfidFare.mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
    unlockVoicePlayback.mockReset()
    lastOnRead = undefined
    applyScannedQr.mockReturnValue({ id: 'posted' })
    addRfidFare.mockReturnValue({ id: 'rfid' })
  })

  it('posts the Amul milk catalog price as soon as the pack is scanned', async () => {
    const user = userEvent.setup()
    renderScan()
    await user.click(screen.getByRole('button', { name: /simulate pack scan/i }))

    expect(applyScannedQr).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 32, items: [expect.objectContaining({ name: 'Milk', price: 32 })] }),
    )
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument()
    expect(await screen.findByText(/added to wallet/i)).toBeInTheDocument()
    expect(toastSuccess).toHaveBeenCalled()
  })

  it('lists the shop catalog on the scan page', () => {
    renderScan()
    expect(screen.getByText('Parle-G')).toBeInTheDocument()
    expect(screen.getByText('Maggi')).toBeInTheDocument()
    expect(screen.getByText(/₹32/)).toBeInTheDocument()
  })

  it('posts a shop QR bill amount when bill scan is selected', async () => {
    const user = userEvent.setup()
    renderScan()
    await user.click(screen.getByRole('button', { name: /qr bill/i }))
    await user.click(screen.getByRole('button', { name: /simulate bill qr/i }))

    expect(applyScannedQr).toHaveBeenCalledWith(expect.objectContaining({ id: 'EK-2026-000399', amount: 77 }))
    expect(unlockVoicePlayback).toHaveBeenCalled()
    expect(await screen.findByText(/added to wallet/i)).toBeInTheDocument()
  })

  it('does not change the wallet when the pack is not in the catalog', () => {
    renderScan()
    lastOnRead?.('unknown snack brand xyz')
    expect(applyScannedQr).not.toHaveBeenCalled()
    expect(addRfidFare).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalled()
    expect(screen.queryByText(/added to wallet/i)).not.toBeInTheDocument()
  })

  it('posts ₹20 / ₹50 / ₹100 when a bus, metro, or canteen RFID barcode is read', async () => {
    renderScan()
    lastOnRead?.('BUS-21G')
    expect(addRfidFare).toHaveBeenCalledWith(expect.objectContaining({ amount: 20, merchant: 'Bus Route 21G' }))

    addRfidFare.mockClear()
    lastOnRead?.('METRO GATE A')
    expect(addRfidFare).toHaveBeenCalledWith(expect.objectContaining({ amount: 50, merchant: 'City Metro' }))

    addRfidFare.mockClear()
    lastOnRead?.('CANTEEN')
    expect(addRfidFare).toHaveBeenCalledWith(expect.objectContaining({ amount: 100, merchant: 'Campus Canteen' }))
    expect(applyScannedQr).not.toHaveBeenCalled()
    expect(await screen.findByText(/added to wallet/i)).toBeInTheDocument()
  })

  it('posts the bus fare when a USB RFID wedge taps a known card', async () => {
    const user = userEvent.setup()
    renderScan()
    await user.keyboard('EKRFID21G{Enter}')
    expect(addRfidFare).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'EKRFID21G', amount: 20 }),
    )
  })
})

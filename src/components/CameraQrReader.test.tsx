import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CameraQrReader } from './CameraQrReader'
import { decodeQrFromFile } from '@/lib/decodeQr'

vi.mock('@/lib/decodeQr', () => ({
  decodeQrFromFile: vi.fn(),
  decodeQrFromVideoFrame: vi.fn(() => null),
}))

const mockedDecodeFile = vi.mocked(decodeQrFromFile)

describe('CameraQrReader', () => {
  beforeEach(() => {
    mockedDecodeFile.mockReset()
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
      },
    })
  })

  it('decodes an uploaded QR photo without BarcodeDetector', async () => {
    mockedDecodeFile.mockResolvedValue('https://e-khata.local/pay?ref=abc')
    const onRead = vi.fn()
    render(<CameraQrReader onRead={onRead} />)

    const file = new File(['img'], 'qr.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/upload qr photo/i), { target: { files: [file] } })

    await waitFor(() => {
      expect(onRead).toHaveBeenCalledWith('https://e-khata.local/pay?ref=abc')
    })
    expect(screen.queryByText(/cannot read a photo qr/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/upload qr photo/i)).not.toHaveAttribute('capture')
  })

  it('tells the user when the photo has no readable QR', async () => {
    mockedDecodeFile.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(null), 20)),
    )
    render(<CameraQrReader onRead={vi.fn()} />)

    const file = new File(['img'], 'blank.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/upload qr photo/i), { target: { files: [file] } })

    expect(await screen.findByRole('alert')).toHaveTextContent(/no readable qr/i)
    expect(screen.queryByText(/allow camera access/i)).not.toBeInTheDocument()
  })
})

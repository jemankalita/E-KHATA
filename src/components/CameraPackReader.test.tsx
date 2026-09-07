import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CameraPackReader } from './CameraPackReader'
import { readPackText } from '@/lib/recognizePack'

vi.mock('@/lib/recognizePack', () => ({
  readPackText: vi.fn(),
}))

const mockedRead = vi.mocked(readPackText)

describe('CameraPackReader', () => {
  beforeEach(() => {
    mockedRead.mockReset()
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
      },
    })
  })

  it('reads a pack photo and forwards the label text', async () => {
    mockedRead.mockResolvedValue('AMUL TAAZA TONED MILK 500ml')
    const onRead = vi.fn()
    render(<CameraPackReader onRead={onRead} />)

    const file = new File(['img'], 'amul.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/upload pack photo/i), { target: { files: [file] } })

    await waitFor(() => {
      expect(onRead).toHaveBeenCalledWith('AMUL TAAZA TONED MILK 500ml')
    })
  })

  it('tells the user when the pack photo has no readable brand', async () => {
    mockedRead.mockResolvedValue('')
    render(<CameraPackReader onRead={vi.fn()} />)

    const file = new File(['img'], 'blank.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/upload pack photo/i), { target: { files: [file] } })

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not read a product name/i)
  })
})

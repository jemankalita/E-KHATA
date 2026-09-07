import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShopkeeperUploadPage } from './ShopkeeperUploadPage'

const runOcr = vi.fn()
const setOcrDraft = vi.fn()

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    ocrDraft: null,
    ocrBusy: false,
    runOcr,
    setOcrDraft,
  }),
}))

describe('ShopkeeperUploadPage', () => {
  beforeEach(() => {
    runOcr.mockReset()
    setOcrDraft.mockReset()
  })

  it('lets the shopkeeper choose a bill photo', () => {
    render(
      <MemoryRouter>
        <ShopkeeperUploadPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /scan the bill/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/bill photo/i)).toBeInTheDocument()
  })

  it('rejects a non-image file without calling OCR', () => {
    render(
      <MemoryRouter>
        <ShopkeeperUploadPage />
      </MemoryRouter>,
    )
    const file = new File(['not an image'], 'notes.txt', { type: 'text/plain' })
    fireEvent.change(screen.getByLabelText(/bill photo/i), { target: { files: [file] } })
    expect(runOcr).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/not an image/i)
  })
})

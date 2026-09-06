import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KhataProvider } from '../store/KhataStore'
import { CustomerHomePage } from './CustomerHomePage'

beforeEach(() => {
  vi.stubGlobal(
    'EventSource',
    class {
      onmessage = null
      close() {}
    },
  )
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('offline'))),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CustomerHomePage', () => {
  it('opens the selected account without phone, ID, or QR scan', () => {
    render(
      <MemoryRouter>
        <KhataProvider>
          <CustomerHomePage />
        </KhataProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /my khata/i })).toBeInTheDocument()
    expect(screen.getAllByText('Aarav Mehta').length).toBeGreaterThan(0)
    expect(screen.queryByLabelText(/phone or customer id/i)).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('9876543210')).not.toBeInTheDocument()
    expect(screen.queryByText(/scan/i)).not.toBeInTheDocument()
  })
})

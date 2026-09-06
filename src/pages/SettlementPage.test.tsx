import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KhataProvider } from '../store/KhataStore'
import { SettlementPage } from './SettlementPage'

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

describe('SettlementPage', () => {
  it('shows automatic settlement and has no manual settle action', () => {
    render(
      <MemoryRouter>
        <KhataProvider>
          <SettlementPage />
        </KhataProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /settlement/i })).toBeInTheDocument()
    expect(screen.getAllByText(/automatic/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /settle e-khata/i })).not.toBeInTheDocument()
  })
})

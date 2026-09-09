import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { INITIAL_STATE } from '@/data/demo'
import { ShopkeeperCreditPage } from './ShopkeeperCreditPage'

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    correctBill: vi.fn(),
    state: INITIAL_STATE,
  }),
}))

describe('ShopkeeperCreditPage', () => {
  it('shows the explainable khata score for the queried customer', () => {
    render(
      <MemoryRouter initialEntries={['/shopkeeper/credit?customer=Rahul%20Sharma']}>
        <ShopkeeperCreditPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Credit file' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rahul Sharma' })).toBeInTheDocument()
    expect(screen.getByText(/alternative data/i)).toBeInTheDocument()
    expect(screen.getByText(/days to settle/i)).toBeInTheDocument()
  })
})

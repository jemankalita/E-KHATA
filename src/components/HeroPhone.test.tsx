import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroPhone } from './HeroPhone'

describe('HeroPhone', () => {
  it('shows the e-Khata dashboard inside an animated phone', () => {
    const { container } = render(<HeroPhone />)
    const phone = within(container).getByRole('img', {
      name: /e-khata on a phone: outstanding balance, khata graph, and open shop bills/i,
    })
    expect(phone).toBeInTheDocument()
    expect(within(phone).getByText(/outstanding/i)).toBeInTheDocument()
    expect(within(phone).getByText(/₹12,480/)).toBeInTheDocument()
    expect(within(phone).getByText('Sharma Stores')).toBeInTheDocument()
    expect(within(phone).getByLabelText(/khata graph/i)).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LandingPage } from './LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('offers two account paths without scan or month-end settlement copy', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: /traditional credit/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /continue as customer/i })).toHaveAttribute('href', '/customer')
    expect(screen.getByRole('link', { name: /continue as shopkeeper/i })).toHaveAttribute('href', '/shop')
    expect(screen.queryByText(/month end/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/scan/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/phone/i)).not.toBeInTheDocument()
  })
})

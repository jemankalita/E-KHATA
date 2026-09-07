import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginScanScene } from './LoginScanScene'

describe('LoginScanScene', () => {
  it('exposes the QR scan and money-flow story to assistive tech', () => {
    render(<LoginScanScene />)
    expect(
      screen.getByRole('img', { name: /person scanning a shop qr while money flows into e-khata/i }),
    ).toBeInTheDocument()
  })
})

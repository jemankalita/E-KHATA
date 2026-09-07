import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MoneyGraph } from './MoneyGraph'

describe('MoneyGraph', () => {
  it('exposes the outstanding trend to assistive tech', () => {
    render(<MoneyGraph values={[10, 20, 40]} label="Outstanding over recent entries" />)
    expect(screen.getByRole('img', { name: /outstanding over recent entries/i })).toBeInTheDocument()
    expect(screen.getByText(/average/i)).toBeInTheDocument()
    expect(screen.getByText(/peak/i)).toBeInTheDocument()
  })
})

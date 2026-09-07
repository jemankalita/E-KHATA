import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthCallbackPage } from './AuthCallbackPage'

const navigate = vi.fn()
const finishGoogleSignIn = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    finishGoogleSignIn,
    configured: true,
  }),
}))

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    navigate.mockReset()
    finishGoogleSignIn.mockReset()
  })

  it('sends a returning shopkeeper to the shop dashboard', async () => {
    finishGoogleSignIn.mockResolvedValue('shopkeeper')
    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/shopkeeper', { replace: true })
    })
  })

  it('returns to login when the Google session cannot be finished', async () => {
    finishGoogleSignIn.mockRejectedValue(new Error('missing session'))
    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})

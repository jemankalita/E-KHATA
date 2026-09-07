import { render, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetGoogleCallbackInFlight } from '@/lib/auth'
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
    resetGoogleCallbackInFlight()
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
      expect(navigate).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { authError: 'missing session' },
      })
    })
  })

  it('finishes Google sign-in once when React Strict Mode remounts the callback', async () => {
    let settle: (role: 'customer') => void = () => undefined
    finishGoogleSignIn.mockImplementation(
      () =>
        new Promise<'customer'>((resolve) => {
          settle = resolve
        }),
    )

    render(
      <StrictMode>
        <MemoryRouter>
          <AuthCallbackPage />
        </MemoryRouter>
      </StrictMode>,
    )

    await waitFor(() => {
      expect(finishGoogleSignIn).toHaveBeenCalledTimes(1)
    })
    settle('customer')
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/customer', { replace: true })
    })
  })
})

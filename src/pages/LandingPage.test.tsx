import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

const signInWithGoogle = vi.fn()

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

vi.mock('@/hooks/useKhata', () => ({
  useKhata: () => ({
    setRole: vi.fn(),
    resetDemo: vi.fn(),
  }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    session: null,
    profile: null,
    loading: false,
    configured: true,
    signInWithGoogle,
    signOut: vi.fn(),
  }),
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

describe('LoginPage', () => {
  it('offers two account paths without month-end settlement copy', () => {
    const { container } = renderLogin()
    const view = within(container)
    expect(view.getByRole('heading', { name: /trust captured/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /continue as\s*customer/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /continue as\s*shopkeeper/i })).toBeInTheDocument()
    expect(view.queryByText(/month end/i)).not.toBeInTheDocument()
  })

  it('links the brand wordmark to the login route', () => {
    const { container } = renderLogin()
    expect(within(container).getByRole('link', { name: /^e-khata$/i })).toHaveAttribute('href', '/login')
  })

  it('shows a person scanning a shop QR with money flowing in', () => {
    const { container } = renderLogin()
    expect(
      within(container).getByRole('img', { name: /person scanning a shop qr while money flows into e-khata/i }),
    ).toBeInTheDocument()
  })

  it('signs in with Google as the chosen role', async () => {
    const user = userEvent.setup()
    const { container } = renderLogin()
    await user.click(within(container).getByRole('button', { name: /continue as\s*customer/i }))
    expect(signInWithGoogle).toHaveBeenCalledWith('customer')

    await user.click(within(container).getByRole('button', { name: /continue as\s*shopkeeper/i }))
    expect(signInWithGoogle).toHaveBeenCalledWith('shopkeeper')
  })
})

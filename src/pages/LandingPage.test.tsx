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
    expect(view.getByRole('heading', { name: /simplify your khata/i })).toBeInTheDocument()
    expect(view.getByText(/the bill is posted once/i)).toBeInTheDocument()
    expect(view.getByRole('button', { name: /continue as\s*customer/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /continue as\s*shopkeeper/i })).toBeInTheDocument()
    expect(view.queryByText(/month end/i)).not.toBeInTheDocument()
  })

  it('links the brand wordmark to the login route', () => {
    const { container } = renderLogin()
    expect(within(container).getByRole('link', { name: /^e-khata$/i })).toHaveAttribute('href', '/login')
  })

  it('keeps the theme switch in a non-shrinking header cluster beside the brand', () => {
    const { container } = renderLogin()
    const view = within(container)
    const brand = view.getByRole('link', { name: /^e-khata$/i })
    const theme = view.getByRole('group', { name: /color theme/i })
    const headerBar = brand.closest('header')?.querySelector('[data-testid="login-header-bar"]')

    expect(headerBar).toBeTruthy()
    expect(headerBar).toContainElement(brand)
    expect(headerBar).toContainElement(theme)
    expect(theme.parentElement).toHaveClass('shrink-0')
    expect(brand.querySelector('[data-brand-name]')).toHaveClass('whitespace-nowrap')
  })

  it('plays the night video behind the landing page in dark mode', () => {
    const { container } = renderLogin()
    const video = within(container).getByTestId('landing-video-backdrop').querySelector('video')
    expect(video).toHaveAttribute('src', '/backgrounds/landing-night.mp4')
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveProperty('loop', true)
  })

  it('places the kirana scan scene in the hero and the phone lower on the page', () => {
    const { container } = renderLogin()
    const kirana = within(container).getByRole('img', {
      name: /person scanning a shop qr while money flows into e-khata/i,
    })
    const phone = within(container).getByRole('img', {
      name: /e-khata on a phone: outstanding balance, khata graph, and open shop bills/i,
    })
    expect(
      kirana.compareDocumentPosition(phone) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
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

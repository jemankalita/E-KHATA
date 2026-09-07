import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  authCallbackUrl,
  consumeIntendedRole,
  dashboardPath,
  ensureProfile,
  googleOAuthOptions,
  parseRole,
  rememberIntendedRole,
  resolveOAuthSession,
  resetGoogleCallbackInFlight,
  runOnceGoogleCallback,
  startGoogleSignIn,
} from './auth'

describe('parseRole', () => {
  it('accepts only customer and shopkeeper', () => {
    expect(parseRole('customer')).toBe('customer')
    expect(parseRole('shopkeeper')).toBe('shopkeeper')
    expect(parseRole('admin')).toBeNull()
    expect(parseRole(null)).toBeNull()
  })
})

describe('intended role storage', () => {
  const storage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }

  beforeEach(() => {
    storage.getItem.mockReset()
    storage.setItem.mockReset()
    storage.removeItem.mockReset()
  })

  it('remembers the role the user picked before Google redirect', () => {
    rememberIntendedRole(storage as unknown as Storage, 'shopkeeper')
    expect(storage.setItem).toHaveBeenCalledWith('ekhata-intended-role', 'shopkeeper')
  })

  it('consumes a stored role once and defaults to customer', () => {
    storage.getItem.mockReturnValue('shopkeeper')
    expect(consumeIntendedRole(storage as unknown as Storage)).toBe('shopkeeper')
    expect(storage.removeItem).toHaveBeenCalledWith('ekhata-intended-role')

    storage.getItem.mockReturnValue(null)
    expect(consumeIntendedRole(storage as unknown as Storage)).toBe('customer')
  })
})

describe('auth routing helpers', () => {
  it('sends each role to its dashboard', () => {
    expect(dashboardPath('customer')).toBe('/customer')
    expect(dashboardPath('shopkeeper')).toBe('/shopkeeper')
  })

  it('builds a Google OAuth callback on this origin', () => {
    expect(authCallbackUrl('http://localhost:5173')).toBe('http://localhost:5173/auth/callback')
    expect(googleOAuthOptions('http://localhost:5173')).toEqual({
      redirectTo: 'http://localhost:5173/auth/callback',
    })
  })
})

describe('resolveOAuthSession', () => {
  it('uses an existing session without exchanging a code', async () => {
    const session = { user: { id: 'u1' } }
    const exchangeCodeForSession = vi.fn()
    const resolved = await resolveOAuthSession({
      href: 'http://localhost:5173/auth/callback',
      getSession: async () => ({ data: { session }, error: null }),
      exchangeCodeForSession,
    })
    expect(resolved).toBe(session)
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('exchanges the PKCE code when the callback lands without a session yet', async () => {
    const session = { user: { id: 'u2' } }
    const resolved = await resolveOAuthSession({
      href: 'http://localhost:5173/auth/callback?code=pkce-code',
      getSession: async () => ({ data: { session: null }, error: null }),
      exchangeCodeForSession: async (code) => {
        expect(code).toBe('pkce-code')
        return { data: { session }, error: null }
      },
    })
    expect(resolved).toBe(session)
  })

  it('recovers when the PKCE code was already consumed by the client', async () => {
    const session = { user: { id: 'u3' } }
    let calls = 0
    const resolved = await resolveOAuthSession({
      href: 'http://localhost:5173/auth/callback?code=used',
      getSession: async () => {
        calls += 1
        return { data: { session: calls > 1 ? session : null }, error: null }
      },
      exchangeCodeForSession: async () => ({
        data: { session: null },
        error: { message: 'invalid request: both auth code and code verifier should be non-empty' },
      }),
    })
    expect(resolved).toBe(session)
  })

  it('fails clearly when Google returns neither a session nor a code', async () => {
    await expect(
      resolveOAuthSession({
        href: 'http://localhost:5173/auth/callback',
        getSession: async () => ({ data: { session: null }, error: null }),
        exchangeCodeForSession: vi.fn(),
      }),
    ).rejects.toThrow(/did not return a session/i)
  })

  it('surfaces Google or Supabase errors from the callback URL', async () => {
    await expect(
      resolveOAuthSession({
        href: 'http://localhost:5173/auth/callback?error=access_denied&error_description=User+cancelled',
        getSession: async () => ({ data: { session: null }, error: null }),
        exchangeCodeForSession: vi.fn(),
      }),
    ).rejects.toThrow(/User cancelled/)
  })
})

describe('runOnceGoogleCallback', () => {
  it('reuses the in-flight Google finish so React Strict Mode cannot spend the PKCE code twice', async () => {
    resetGoogleCallbackInFlight()
    let starts = 0
    const run = () => {
      starts += 1
      return Promise.resolve('shopkeeper' as const)
    }
    const [first, second] = await Promise.all([runOnceGoogleCallback(run), runOnceGoogleCallback(run)])
    expect(starts).toBe(1)
    expect(first).toBe('shopkeeper')
    expect(second).toBe('shopkeeper')
    resetGoogleCallbackInFlight()
  })
})

describe('ensureProfile', () => {
  it('returns an existing profile and does not let the picker overwrite the role', async () => {
    const existing = {
      id: 'user-1',
      role: 'shopkeeper',
      display_name: 'Rina',
      email: 'rina@shop.test',
      avatar_url: null,
    }
    const insert = vi.fn()
    const client = {
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: existing, error: null }),
          }),
        }),
        insert,
      })),
    }

    const profile = await ensureProfile(client as never, {
      id: 'user-1',
      email: 'rina@shop.test',
      user_metadata: { full_name: 'Rina' },
    }, 'customer')

    expect(profile.role).toBe('shopkeeper')
    expect(insert).not.toHaveBeenCalled()
  })

  it('creates a profile with the intended role on first sign-in', async () => {
    const created = {
      id: 'user-2',
      role: 'customer',
      display_name: 'Aman',
      email: 'aman@mail.test',
      avatar_url: 'https://lh3.google/photo',
    }
    const client = {
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: created, error: null }),
          }),
        }),
      })),
    }

    const profile = await ensureProfile(client as never, {
      id: 'user-2',
      email: 'aman@mail.test',
      user_metadata: { full_name: 'Aman', avatar_url: 'https://lh3.google/photo' },
    }, 'customer')

    expect(profile).toEqual({
      id: 'user-2',
      role: 'customer',
      displayName: 'Aman',
      email: 'aman@mail.test',
      avatarUrl: 'https://lh3.google/photo',
    })
  })
})

describe('startGoogleSignIn', () => {
  it('stores the role and starts the Google OAuth redirect', async () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
    const signInWithOAuth = vi.fn(async () => ({ data: {}, error: null }))
    const client = { auth: { signInWithOAuth } }

    await startGoogleSignIn({
      client: client as never,
      storage: storage as unknown as Storage,
      origin: 'http://localhost:5173',
      role: 'shopkeeper',
    })

    expect(storage.setItem).toHaveBeenCalledWith('ekhata-intended-role', 'shopkeeper')
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/auth/callback',
      },
    })
  })

  it('fails clearly when Supabase is not configured', async () => {
    await expect(
      startGoogleSignIn({
        client: null,
        storage: { setItem: vi.fn() } as unknown as Storage,
        origin: 'http://localhost:5173',
        role: 'customer',
      }),
    ).rejects.toThrow(/supabase is not configured/i)
  })
})

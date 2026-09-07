import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  authCallbackUrl,
  consumeIntendedRole,
  dashboardPath,
  ensureProfile,
  googleOAuthOptions,
  parseRole,
  rememberIntendedRole,
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
      queryParams: { access_type: 'offline', prompt: 'consent' },
    })
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
        queryParams: { access_type: 'offline', prompt: 'consent' },
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

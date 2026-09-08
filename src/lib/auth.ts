import type { Role } from '@/types'

export const INTENDED_ROLE_KEY = 'ekhata-intended-role'
export const AUTH_CALLBACK_PATH = '/auth/callback'

export interface AuthUser {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}

export interface ProfileRow {
  id: string
  role: string
  display_name: string
  email: string
  avatar_url: string | null
}

export interface Profile {
  id: string
  role: Role
  displayName: string
  email: string
  avatarUrl: string | null
}

export interface ProfileQuery {
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): PromiseLike<{ data: ProfileRow | null; error: { message: string } | null }>
    }
  }
  insert(row: Record<string, unknown>): {
    select(): {
      single(): PromiseLike<{ data: ProfileRow | null; error: { message: string } | null }>
    }
  }
}

export interface ProfileClient {
  from(table: 'profiles'): ProfileQuery
}

export interface GoogleAuthClient {
  auth: {
    signInWithOAuth(args: {
      provider: 'google'
      options: ReturnType<typeof googleOAuthOptions>
    }): Promise<{ data?: { url?: string | null }; error: { message: string } | null }>
  }
}

export function parseRole(value: unknown): Role | null {
  return value === 'customer' || value === 'shopkeeper' ? value : null
}

export function rememberIntendedRole(storage: Storage, role: Role) {
  storage.setItem(INTENDED_ROLE_KEY, role)
}

export function consumeIntendedRole(storage: Storage): Role {
  const role = parseRole(storage.getItem(INTENDED_ROLE_KEY)) ?? 'customer'
  storage.removeItem(INTENDED_ROLE_KEY)
  return role
}

export function dashboardPath(role: Role) {
  return role === 'shopkeeper' ? '/shopkeeper' : '/customer'
}

export function authCallbackUrl(origin: string) {
  return `${origin}${AUTH_CALLBACK_PATH}`
}

export function googleOAuthOptions(origin: string, options?: { stayInApp?: boolean }) {
  return {
    redirectTo: authCallbackUrl(origin),
    ...(options?.stayInApp ? { skipBrowserRedirect: true } : {}),
  }
}

function searchParamsFromHref(href: string): URLSearchParams {
  const url = new URL(href)
  const merged = new URLSearchParams(url.searchParams)
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
  if (hash.includes('=')) {
    new URLSearchParams(hash).forEach((value, key) => {
      if (!merged.has(key)) merged.set(key, value)
    })
  }
  return merged
}

export function authCodeFromUrl(href: string): string | null {
  try {
    return searchParamsFromHref(href).get('code')
  } catch {
    return null
  }
}

export function oauthErrorFromUrl(href: string): string | null {
  try {
    const params = searchParamsFromHref(href)
    const error = params.get('error')
    if (!error) return null
    const description = params.get('error_description')
    if (!description) return error.replaceAll('_', ' ')
    return description.replaceAll('+', ' ')
  } catch {
    return null
  }
}

let googleCallbackInFlight: Promise<unknown> | null = null

export function resetGoogleCallbackInFlight() {
  googleCallbackInFlight = null
}

export function runOnceGoogleCallback<T>(run: () => Promise<T>): Promise<T> {
  if (!googleCallbackInFlight) {
    googleCallbackInFlight = run()
  }
  return googleCallbackInFlight as Promise<T>
}

export async function resolveOAuthSession<TSession>(input: {
  href: string
  getSession: () => Promise<{ data: { session: TSession | null }; error: { message: string } | null }>
  exchangeCodeForSession: (
    code: string,
  ) => Promise<{ data: { session: TSession | null }; error: { message: string } | null }>
}): Promise<TSession> {
  const oauthError = oauthErrorFromUrl(input.href)
  if (oauthError) throw new Error(oauthError)

  const existing = await input.getSession()
  if (existing.error) throw new Error(existing.error.message)
  if (existing.data.session) return existing.data.session

  const code = authCodeFromUrl(input.href)
  if (!code) {
    throw new Error('Google sign-in did not return a session. Try Continue as Customer or Shopkeeper again.')
  }

  const exchanged = await input.exchangeCodeForSession(code)
  if (exchanged.data.session) return exchanged.data.session

  const afterExchange = await input.getSession()
  if (afterExchange.data.session) return afterExchange.data.session

  if (exchanged.error) throw new Error(exchanged.error.message)
  throw new Error('Google sign-in did not return a session. Try Continue as Customer or Shopkeeper again.')
}

export function toProfile(row: ProfileRow): Profile {
  const role = parseRole(row.role)
  if (!role) {
    throw new Error('This account has an invalid role. Sign in again or contact support.')
  }
  return {
    id: row.id,
    role,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
  }
}

function displayNameFromUser(user: AuthUser) {
  const meta = user.user_metadata ?? {}
  if (typeof meta.full_name === 'string' && meta.full_name.trim()) return meta.full_name
  if (typeof meta.name === 'string' && meta.name.trim()) return meta.name
  return user.email ?? 'E-Khata user'
}

function avatarFromUser(user: AuthUser) {
  const meta = user.user_metadata ?? {}
  if (typeof meta.avatar_url === 'string') return meta.avatar_url
  if (typeof meta.picture === 'string') return meta.picture
  return null
}

export async function loadProfile(client: ProfileClient, userId: string): Promise<Profile | null> {
  const existing = await client.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (existing.error) throw new Error(existing.error.message)
  if (!existing.data) return null
  return toProfile(existing.data)
}

export async function ensureProfile(
  client: ProfileClient,
  user: AuthUser,
  intendedRole: Role,
): Promise<Profile> {
  const existing = await client.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (existing.error) throw new Error(existing.error.message)
  if (existing.data) return toProfile(existing.data)

  const inserted = await client
    .from('profiles')
    .insert({
      id: user.id,
      role: intendedRole,
      display_name: displayNameFromUser(user),
      email: user.email ?? '',
      avatar_url: avatarFromUser(user),
    })
    .select()
    .single()

  if (inserted.error) {
    const retry = await client.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (retry.data) return toProfile(retry.data)
    throw new Error(inserted.error.message)
  }
  if (!inserted.data) throw new Error('Could not create your E-Khata profile.')
  return toProfile(inserted.data)
}

export async function startGoogleSignIn(input: {
  client: GoogleAuthClient | null
  storage: Storage
  origin: string
  role: Role
  stayInApp?: boolean
  assignUrl?: (url: string) => void
}) {
  if (!input.client) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  resetGoogleCallbackInFlight()
  rememberIntendedRole(input.storage, input.role)
  const { data, error } = await input.client.auth.signInWithOAuth({
    provider: 'google',
    options: googleOAuthOptions(input.origin, { stayInApp: input.stayInApp }),
  })
  if (error) throw new Error(error.message)
  if (input.stayInApp) {
    if (!data?.url) {
      throw new Error('Google sign-in did not return a sign-in URL. Try again.')
    }
    ;(input.assignUrl ?? ((url: string) => window.location.assign(url)))(data.url)
  }
}

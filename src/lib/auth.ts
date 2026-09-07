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
    }): Promise<{ error: { message: string } | null }>
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

export function googleOAuthOptions(origin: string) {
  return {
    redirectTo: authCallbackUrl(origin),
    queryParams: { access_type: 'offline', prompt: 'consent' },
  }
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
}) {
  if (!input.client) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  rememberIntendedRole(input.storage, input.role)
  const { error } = await input.client.auth.signInWithOAuth({
    provider: 'google',
    options: googleOAuthOptions(input.origin),
  })
  if (error) throw new Error(error.message)
}

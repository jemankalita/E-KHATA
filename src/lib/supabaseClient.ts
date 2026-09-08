import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolveSupabaseConfig } from './runtimeConfig'

let client: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client
  const { url, anonKey, configured } = resolveSupabaseConfig(import.meta.env)
  if (!configured) {
    client = null
    return client
  }
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  })
  return client
}

export function isSupabaseConfigured() {
  return resolveSupabaseConfig(import.meta.env).configured
}

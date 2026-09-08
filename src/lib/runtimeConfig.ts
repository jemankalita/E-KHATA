export const DEFAULT_SUPABASE_URL = 'https://cetowfbuumebmawpcucb.supabase.co'

export const NATIVE_ALLOW_NAVIGATION = [
  '*.supabase.co',
  '*.razorpay.com',
  'checkout.razorpay.com',
  'api.razorpay.com',
  '*.google.com',
  '*.google.co.in',
  '*.gstatic.com',
  'accounts.youtube.com',
] as const

export interface RuntimeEnv {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
  VITE_RAZORPAY_KEY_ID?: string
  VITE_API_BASE_URL?: string
}

export function resolveSupabaseConfig(env: RuntimeEnv) {
  const url = env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '') || DEFAULT_SUPABASE_URL
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  }
}

export function resolveRazorpayKey(env: RuntimeEnv) {
  return env.VITE_RAZORPAY_KEY_ID?.trim() ?? ''
}

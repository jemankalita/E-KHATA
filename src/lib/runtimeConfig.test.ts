import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SUPABASE_URL,
  NATIVE_ALLOW_NAVIGATION,
  resolveRazorpayKey,
  resolveSupabaseConfig,
} from './runtimeConfig'

describe('resolveSupabaseConfig', () => {
  it('uses explicit env values when both are set', () => {
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: ' https://example.supabase.co/ ',
        VITE_SUPABASE_ANON_KEY: ' anon-key ',
      }),
    ).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
      configured: true,
    })
  })

  it('keeps the project database URL when the env url is blank', () => {
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: '  ',
        VITE_SUPABASE_ANON_KEY: 'anon-key',
      }),
    ).toEqual({
      url: DEFAULT_SUPABASE_URL,
      anonKey: 'anon-key',
      configured: true,
    })
  })

  it('is not configured without an anon key', () => {
    expect(resolveSupabaseConfig({})).toEqual({
      url: DEFAULT_SUPABASE_URL,
      anonKey: '',
      configured: false,
    })
  })
})

describe('resolveRazorpayKey', () => {
  it('trims a public Razorpay key id', () => {
    expect(resolveRazorpayKey({ VITE_RAZORPAY_KEY_ID: ' rzp_test_abc ' })).toBe('rzp_test_abc')
  })

  it('returns empty when checkout is not configured', () => {
    expect(resolveRazorpayKey({})).toBe('')
  })
})

describe('NATIVE_ALLOW_NAVIGATION', () => {
  it('keeps OAuth and checkout hosts in the WebView and never the hosted website', () => {
    expect(NATIVE_ALLOW_NAVIGATION).toEqual(
      expect.arrayContaining(['*.supabase.co', '*.razorpay.com', '*.google.com']),
    )
    expect(NATIVE_ALLOW_NAVIGATION).not.toContain('ekhata-gamma.vercel.app')
  })
})

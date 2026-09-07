import { describe, expect, it } from 'vitest'
import { resolveApiOrigin, resolveApiUrl } from './apiUrl'

describe('resolveApiOrigin', () => {
  it('keeps same-origin relative APIs on the web', () => {
    expect(resolveApiOrigin({ native: false })).toBe('')
  })

  it('uses an explicit env origin on web and native', () => {
    expect(resolveApiOrigin({ native: false, envOrigin: 'https://api.example.com/' })).toBe(
      'https://api.example.com',
    )
    expect(resolveApiOrigin({ native: true, envOrigin: 'https://api.example.com/' })).toBe(
      'https://api.example.com',
    )
  })

  it('falls back to the hosted web app when the native shell has no env origin', () => {
    expect(resolveApiOrigin({ native: true })).toBe('https://ekhata-gamma.vercel.app')
  })
})

describe('resolveApiUrl', () => {
  it('returns a relative path for web so Vite and Vercel keep working', () => {
    expect(resolveApiUrl('/api/voice', { native: false })).toBe('/api/voice')
    expect(resolveApiUrl('api/state', { native: false })).toBe('/api/state')
  })

  it('prefixes the hosted origin inside the Android WebView', () => {
    expect(resolveApiUrl('/api/voice', { native: true })).toBe(
      'https://ekhata-gamma.vercel.app/api/voice',
    )
  })
})

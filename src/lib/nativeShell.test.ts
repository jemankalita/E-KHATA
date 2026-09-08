import { describe, expect, it, vi } from 'vitest'
import { openNativeAppUrl } from './nativeShell'

describe('openNativeAppUrl', () => {
  it('replaces the WebView location with the in-app callback path', () => {
    const assignPath = vi.fn()
    expect(openNativeAppUrl('https://ekhata-gamma.vercel.app/auth/callback?code=1', assignPath)).toBe(
      true,
    )
    expect(assignPath).toHaveBeenCalledWith('/auth/callback?code=1')
  })

  it('ignores urls that belong outside the app', () => {
    const assignPath = vi.fn()
    expect(openNativeAppUrl('https://accounts.google.com/o/oauth2/v2/auth', assignPath)).toBe(false)
    expect(assignPath).not.toHaveBeenCalled()
  })
})

import { describe, expect, it } from 'vitest'
import { isNativeRuntime } from './nativeRuntime'

describe('isNativeRuntime', () => {
  it('is false in Vitest and the browser build', () => {
    expect(isNativeRuntime()).toBe(false)
  })

  it('is true when the Capacitor bridge reports a native platform', () => {
    const win = { Capacitor: { isNativePlatform: () => true } } as Window & {
      Capacitor: { isNativePlatform: () => boolean }
    }
    expect(isNativeRuntime(win)).toBe(true)
  })
})

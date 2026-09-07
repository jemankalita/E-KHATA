import { describe, expect, it, vi } from 'vitest'
import { handleAndroidBackButton } from './androidBackButton'

describe('handleAndroidBackButton', () => {
  it('pops in-app history when Capacitor reports the WebView can go back', () => {
    const historyBack = vi.fn()
    const exitApp = vi.fn()
    handleAndroidBackButton({ canGoBack: true, historyBack, exitApp })
    expect(historyBack).toHaveBeenCalledTimes(1)
    expect(exitApp).not.toHaveBeenCalled()
  })

  it('exits the app at the root screen', () => {
    const historyBack = vi.fn()
    const exitApp = vi.fn()
    handleAndroidBackButton({ canGoBack: false, historyBack, exitApp })
    expect(historyBack).not.toHaveBeenCalled()
    expect(exitApp).toHaveBeenCalledTimes(1)
  })
})

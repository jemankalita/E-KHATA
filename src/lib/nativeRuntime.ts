import { Capacitor } from '@capacitor/core'

type CapacitorBridge = {
  isNativePlatform?: () => boolean
}

export function isNativeRuntime(win?: Window & { Capacitor?: CapacitorBridge }): boolean {
  if (win) {
    try {
      return Boolean(win.Capacitor?.isNativePlatform?.())
    } catch {
      return false
    }
  }
  return Capacitor.isNativePlatform()
}

import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { handleAndroidBackButton } from './androidBackButton'
import { inAppPathFromUrl } from './appNavigation'
import { isNativeRuntime } from './nativeRuntime'

export function openNativeAppUrl(
  href: string,
  assignPath: (path: string) => void = (path) => {
    window.location.replace(path)
  },
) {
  const path = inAppPathFromUrl(href)
  if (!path) return false
  assignPath(path)
  return true
}

export async function startNativeShell() {
  if (!isNativeRuntime()) return

  App.addListener('backButton', ({ canGoBack }) => {
    handleAndroidBackButton({
      canGoBack,
      historyBack: () => window.history.back(),
      exitApp: () => {
        void App.exitApp()
      },
    })
  })

  App.addListener('appUrlOpen', ({ url }) => {
    openNativeAppUrl(url)
  })

  try {
    const launch = await App.getLaunchUrl()
    if (launch?.url) openNativeAppUrl(launch.url)
  } catch {
    /* launch URL is optional */
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false })
    const dark = document.documentElement.classList.contains('dark')
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
  } catch {
    /* web or unsupported */
  }

  try {
    await SplashScreen.hide()
  } catch {
    /* web or unsupported */
  }
}

import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { handleAndroidBackButton } from './androidBackButton'
import { isNativeRuntime } from './nativeRuntime'

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

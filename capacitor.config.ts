import type { CapacitorConfig } from '@capacitor/cli'
import { NATIVE_ALLOW_NAVIGATION } from './src/lib/runtimeConfig'

const config: CapacitorConfig = {
  appId: 'app.ekhata.placeholder',
  appName: 'E-Khata',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    allowNavigation: [...NATIVE_ALLOW_NAVIGATION],
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#07060f',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#07060f',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#07060f',
    },
  },
}

export default config

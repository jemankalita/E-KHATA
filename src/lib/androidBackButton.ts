export function handleAndroidBackButton(input: {
  canGoBack: boolean
  historyBack: () => void
  exitApp: () => void
}) {
  if (input.canGoBack) {
    input.historyBack()
    return
  }
  input.exitApp()
}

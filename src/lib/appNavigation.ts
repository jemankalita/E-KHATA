export const HOSTED_WEB_ORIGIN = 'https://ekhata-gamma.vercel.app'
export const NATIVE_APP_ORIGIN = 'https://localhost'

const HOSTED_WEB_HOST = 'ekhata-gamma.vercel.app'

function pathAndTail(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`
}

export function inAppPathFromUrl(href: string): string | null {
  try {
    const url = new URL(href)
    const host = url.hostname.toLowerCase()
    if (host === 'localhost' || host === HOSTED_WEB_HOST) {
      return pathAndTail(url) || '/'
    }
    if (url.protocol === 'ekhata:') {
      const path = url.pathname || `/${url.host}`
      return `${path}${url.search}${url.hash}`
    }
    return null
  } catch {
    return null
  }
}

export function rewriteHostedAppUrl(href: string): string | null {
  try {
    const url = new URL(href)
    if (url.hostname.toLowerCase() !== HOSTED_WEB_HOST) return null
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return null
    return `${NATIVE_APP_ORIGIN}${pathAndTail(url)}`
  } catch {
    return null
  }
}

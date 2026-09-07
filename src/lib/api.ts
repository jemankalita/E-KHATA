import { isNativeRuntime } from './nativeRuntime'
import { resolveApiUrl as resolveApiUrlWithOptions } from './apiUrl'

export function apiUrl(path: string): string {
  return resolveApiUrlWithOptions(path, {
    native: isNativeRuntime(),
    envOrigin: import.meta.env.VITE_API_BASE_URL,
  })
}

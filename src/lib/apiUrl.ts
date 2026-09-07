export const DEFAULT_NATIVE_API_ORIGIN = 'https://ekhata-gamma.vercel.app'

export function resolveApiOrigin(input: { native: boolean; envOrigin?: string }): string {
  const fromEnv = input.envOrigin?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (input.native) return DEFAULT_NATIVE_API_ORIGIN
  return ''
}

export function resolveApiUrl(
  path: string,
  options?: { native?: boolean; envOrigin?: string },
): string {
  const origin = resolveApiOrigin({
    native: options?.native ?? false,
    envOrigin: options?.envOrigin,
  })
  const normalized = path.startsWith('/') ? path : `/${path}`
  return origin ? `${origin}${normalized}` : normalized
}

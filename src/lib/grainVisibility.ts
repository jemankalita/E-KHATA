export function grainVisibleOnPath(pathname: string): boolean {
  const path = pathname.split('?')[0] ?? pathname
  return !path.startsWith('/customer/scan')
}

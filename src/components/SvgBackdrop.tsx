import { cn } from '../lib/cn'

/** Flat Obsidian canvas. Elevation comes from surface color, not shadows. */
export function SvgBackdrop({ className }: { className?: string }) {
  return <div className={cn('pointer-events-none fixed inset-0 -z-10 bg-obsidian', className)} aria-hidden="true" />
}

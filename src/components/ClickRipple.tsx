import { useEffect } from 'react'

const INTERACTIVE =
  'button, a, [role="button"], [role="tab"], [role="menuitem"], label, summary, [data-ripple]'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function spawnRipple(host: HTMLElement, clientX: number, clientY: number, clipped: boolean) {
  const rect = host.getBoundingClientRect()
  const reach = clipped
    ? Math.max(rect.width, rect.height, 40) * 2.35
    : Math.max(window.innerWidth, window.innerHeight) * 0.18
  const ink = document.createElement('span')
  ink.className = clipped ? 'ripple-ink' : 'ripple-ink ripple-ink-page'
  ink.style.width = `${reach}px`
  ink.style.height = `${reach}px`

  if (clipped) {
    ink.style.left = `${clientX - rect.left - reach / 2}px`
    ink.style.top = `${clientY - rect.top - reach / 2}px`
    const previousPosition = host.style.position
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative'
    host.classList.add('ripple-surface')
    host.appendChild(ink)
    ink.addEventListener(
      'animationend',
      () => {
        ink.remove()
        if (!host.querySelector('.ripple-ink') && previousPosition === '' && host.style.position === 'relative') {
          host.style.removeProperty('position')
        }
      },
      { once: true },
    )
    return
  }

  ink.style.left = `${clientX - reach / 2}px`
  ink.style.top = `${clientY - reach / 2}px`
  document.body.appendChild(ink)
  ink.addEventListener('animationend', () => ink.remove(), { once: true })
}

export function ClickRipple() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return
      if (prefersReducedMotion()) return
      const raw = event.target
      if (!(raw instanceof Element)) return
      if (raw.closest('[data-no-ripple], .ripple-ink')) return

      const interactive = raw.closest(INTERACTIVE)
      if (interactive instanceof HTMLElement) {
        spawnRipple(interactive, event.clientX, event.clientY, true)
        return
      }

      const host = raw instanceof HTMLElement ? raw : raw.parentElement
      if (
        host &&
        host !== document.body &&
        host !== document.documentElement &&
        host.offsetWidth < 720 &&
        host.offsetHeight < 280
      ) {
        spawnRipple(host, event.clientX, event.clientY, true)
        return
      }

      spawnRipple(document.body, event.clientX, event.clientY, false)
    }

    document.addEventListener('pointerdown', onPointerDown, { capture: true })
    return () => document.removeEventListener('pointerdown', onPointerDown, { capture: true })
  }, [])

  return null
}

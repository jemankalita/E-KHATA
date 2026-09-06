import { Link, NavLink } from 'react-router-dom'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '../lib/cn'
import { MERCHANT_NAME } from '../data/seed'
import { useKhata } from '../store/KhataStore'
import { SHOP_LINKS } from './navLinks'

export function MobileTopBar() {
  const { muted, toggleMute } = useKhata()

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/[0.06] bg-ink-950/85 px-4 py-2.5 backdrop-blur-md lg:hidden">
      <Link to="/" className="flex min-h-11 items-center gap-2">
        <span className="font-display text-xl leading-none">E-Khata</span>
        <span className="sr-only">Back to role picker</span>
      </Link>
      <span aria-hidden="true" className="truncate text-xs text-paper-400">
        {MERCHANT_NAME}
      </span>
      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute Hindi voice confirmation' : 'Mute Hindi voice confirmation'}
        className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full text-paper-300 transition-[background-color] duration-150 hover:bg-black/[0.05]"
      >
        {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}

export function MobileTabBar() {
  return (
    <nav
      aria-label="Shopkeeper sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-ink-800/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {SHOP_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/shop'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 py-2',
                    'transition-[color,background-color] duration-150',
                    isActive ? 'text-teal-500' : 'text-paper-400',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'grid h-7 w-9 place-items-center rounded-full transition-[background-color] duration-150',
                        isActive && 'bg-teal-400/12',
                      )}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-medium leading-none">{link.short}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

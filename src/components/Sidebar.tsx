import { Link, NavLink } from 'react-router-dom'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '../lib/cn'
import { MERCHANT_NAME } from '../data/seed'
import { useKhata } from '../store/KhataStore'
import { SHOP_LINKS } from './navLinks'

export function Sidebar() {
  const { muted, toggleMute } = useKhata()

  return (
    <aside className="flex h-full flex-col border-r border-black/[0.06] bg-ink-900/90 px-4 py-6">
      <div className="px-2">
        <Link to="/" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">
          Shopkeeper
        </Link>
        <p className="font-display mt-1 text-3xl text-paper-50">E-Khata</p>
        <p className="mt-1 text-sm text-paper-400">{MERCHANT_NAME}</p>
      </div>
      <nav aria-label="Shopkeeper sections" className="mt-8 flex flex-1 flex-col gap-1">
        {SHOP_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/shop'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium',
                  'transition-[background-color,color] duration-150',
                  isActive ? 'bg-teal-400/10 text-teal-500' : 'text-paper-200 hover:bg-black/[0.04]',
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={muted}
        className="mt-auto flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-paper-300 transition-[background-color] duration-150 hover:bg-black/[0.04]"
      >
        {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        {muted ? 'Voice muted' : 'Voice on'}
      </button>
    </aside>
  )
}

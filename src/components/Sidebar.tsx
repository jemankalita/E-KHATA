import { Link, NavLink } from 'react-router-dom'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '../lib/cn'
import { MERCHANT_NAME } from '../data/seed'
import { useKhata } from '../store/KhataStore'
import { SHOP_LINKS } from './navLinks'

export function Sidebar() {
  const { muted, toggleMute } = useKhata()

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-abyss px-4 py-6">
      <div className="px-2">
        <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
          Shopkeeper
        </Link>
        <p className="font-display mt-1 text-3xl font-normal italic text-cloud">e-khata</p>
        <p className="mt-1 text-sm text-ash">{MERCHANT_NAME}</p>
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
                  'flex min-h-11 items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm',
                  isActive ? 'bg-steel text-pure' : 'text-ash hover:bg-graphite hover:text-cloud',
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
        className="mt-auto flex min-h-11 items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm text-ash hover:bg-graphite"
      >
        {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        {muted ? 'Voice muted' : 'Voice on'}
      </button>
    </aside>
  )
}

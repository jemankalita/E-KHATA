import { BrandWordmark } from '@/components/BrandLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { useKhata } from '@/hooks/useKhata'
import { cn } from '@/lib/utils'
import { QrCode, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export function SiteHeader() {
  const { role, state } = useKhata()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const path = useLocation().pathname
  const isShop = role === 'shopkeeper'
  const name = profile?.displayName || (isShop ? state.merchant.name : state.customer.name)
  const initial = name.slice(0, 1)
  const home = isShop ? '/shopkeeper' : '/customer'

  const links = isShop
    ? [
        { to: '/shopkeeper', label: 'Home' },
        { to: '/shopkeeper/create', label: 'New bill' },
        { to: '/shopkeeper/qr', label: 'QR' },
      ]
    : [
        { to: '/customer', label: 'Home' },
        { to: '/customer/scan', label: 'Scan' },
        { to: '/customer/settlement', label: 'Pay' },
      ]

  const primary = isShop
    ? { to: '/shopkeeper/create', label: 'New bill' }
    : { to: '/customer/settlement', label: 'Pay' }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-3 px-4 py-2 sm:gap-8 sm:px-6">
        <BrandWordmark showTagline />
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'text-[13px] tracking-[0.04em]',
                path === link.to || (link.to !== home && path.startsWith(link.to))
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to={primary.to}
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground sm:inline-flex"
          >
            {isShop ? <Sparkles className="size-4" /> : <QrCode className="size-4" />}
            {primary.label}
          </Link>
          <ThemeToggle />
          <span className="hidden text-[13px] text-muted-foreground lg:block">{name}</span>
          <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initial}
          </div>
          <button
            type="button"
            className="rounded-full bg-card px-3 py-2 text-[13px] text-foreground shadow-sm sm:px-4"
            onClick={() => {
              void signOut().then(() => navigate('/login', { replace: true }))
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 md:hidden sm:px-6">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="shrink-0 text-[12px] text-muted-foreground">
            {link.label}
          </Link>
        ))}
        <Link to={primary.to} className="shrink-0 text-[12px] text-primary">
          {primary.label}
        </Link>
      </nav>
    </header>
  )
}

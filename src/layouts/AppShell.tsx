import { SiteHeader } from '@/components/Navbar'
import { TermsLink } from '@/components/TermsLink'
import { useKhata } from '@/hooks/useKhata'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

export function AppShell() {
  const location = useLocation()
  const { setRole } = useKhata()

  useEffect(() => {
    if (location.pathname.startsWith('/customer')) setRole('customer')
    if (location.pathname.startsWith('/shopkeeper')) setRole('shopkeeper')
  }, [location.pathname, setRole])

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-6 pb-8">
        <TermsLink />
      </footer>
    </div>
  )
}

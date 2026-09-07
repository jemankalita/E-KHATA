import { SiteHeader } from '@/components/Navbar'
import { TermsLink } from '@/components/TermsLink'
import { useAuth } from '@/hooks/useAuth'
import { useKhata } from '@/hooks/useKhata'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

export function AppShell() {
  const { profile } = useAuth()
  const { setRole } = useKhata()

  useEffect(() => {
    if (profile) setRole(profile.role)
  }, [profile, setRole])

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

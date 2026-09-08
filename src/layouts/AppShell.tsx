import { SiteHeader } from '@/components/Navbar'
import { SettlementAlerts } from '@/components/SettlementAlerts'
import { TermsLink } from '@/components/TermsLink'
import { useAuth } from '@/hooks/useAuth'
import { useKhata } from '@/hooks/useKhata'
import { unlockVoicePlayback } from '@/lib/voice'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

export function AppShell() {
  const { profile } = useAuth()
  const { setRole } = useKhata()

  useEffect(() => {
    if (profile) setRole(profile.role)
  }, [profile, setRole])

  useEffect(() => {
    const prime = () => unlockVoicePlayback()
    window.addEventListener('pointerdown', prime, true)
    window.addEventListener('keydown', prime, true)
    return () => {
      window.removeEventListener('pointerdown', prime, true)
      window.removeEventListener('keydown', prime, true)
    }
  }, [])

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <SettlementAlerts />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <TermsLink />
      </footer>
    </div>
  )
}

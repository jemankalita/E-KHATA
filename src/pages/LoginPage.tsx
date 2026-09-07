import { AtmosphericBackdrop } from '@/components/AtmosphericBackdrop'
import { BrandWordmark } from '@/components/BrandLogo'
import { HeroPhone } from '@/components/HeroPhone'
import { LoginExplainer, LoginSectionNav, useActiveLoginSection } from '@/components/LoginExplainer'
import { LoginScanScene } from '@/components/LoginScanScene'
import { TermsLink } from '@/components/TermsLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useKhata } from '@/hooks/useKhata'
import { useTheme } from '@/hooks/useTheme'
import { dashboardPath } from '@/lib/auth'
import { motionTokens } from '@/lib/motion-tokens'
import { useSafeMotion } from '@/lib/useSafeMotion'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.9 6.62-2.35l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        d="M6.42 13.99A6.01 6.01 0 0 1 6.1 12c0-.69.12-1.36.32-1.99V7.43H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.57l3.34-2.58Z"
      />
      <path
        fill="currentColor"
        d="M12 5.89c1.47 0 2.78.5 3.82 1.5l2.86-2.86C16.95 2.91 14.7 2 12 2A10 10 0 0 0 3.08 7.43l3.34 2.58C7.2 7.65 9.4 5.89 12 5.89Z"
      />
    </svg>
  )
}

export function LoginPage() {
  const { resetDemo, setRole } = useKhata()
  const { configured, loading, profile, signInWithGoogle } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const activeSection = useActiveLoginSection()
  const light = theme === 'light'
  const intro = useSafeMotion(motionTokens.distance.lg)

  useEffect(() => {
    if (!loading && profile) navigate(dashboardPath(profile.role), { replace: true })
  }, [loading, navigate, profile])

  useEffect(() => {
    const authError = (location.state as { authError?: string } | null)?.authError
    if (authError) toast.error(authError)
  }, [location.state])

  async function enterAs(role: 'customer' | 'shopkeeper') {
    if (!configured) {
      setRole(role)
      navigate(dashboardPath(role))
      return
    }
    try {
      await signInWithGoogle(role)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google sign-in failed.')
    }
  }

  const ink = light ? 'text-[#071428]' : 'text-white'
  const mute = light ? 'text-[#071428]' : 'text-white/55'

  return (
    <div className={`relative min-h-svh bg-transparent ${ink}`}>
      <AtmosphericBackdrop />

      <header
        className={`sticky top-0 z-20 border-b backdrop-blur-md ${
          light ? 'border-[#071428]/10 bg-white/90 text-[#071428]' : 'border-white/8 bg-black/35 text-white'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <BrandWordmark className={ink} />
          <LoginSectionNav
            active={activeSection}
            tone={light ? 'bar' : 'sky'}
            className={`hidden items-center gap-1 rounded-full px-5 py-2 md:flex ${
              light ? 'border border-[#071428]/12 bg-white/70' : 'border border-white/10 bg-white/5'
            }`}
          />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="#enter"
              className={`hidden text-[12px] uppercase tracking-[0.16em] sm:inline ${mute} ${
                light ? 'hover:text-[#071428]' : 'hover:text-white'
              }`}
            >
              Log in
            </a>
            <a
              href="#enter"
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] ${
                light ? 'bg-[#0b1f3a] text-white' : 'bg-white text-zinc-950'
              }`}
            >
              Get started <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
        <LoginSectionNav
          active={activeSection}
          tone={light ? 'bar' : 'sky'}
          className="flex gap-5 overflow-x-auto px-6 pb-3 md:hidden"
        />
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16 lg:py-16">
        <div>
          <motion.div
            initial={intro.initial}
            animate={intro.animate}
            transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
          >
            <p className={`text-[12px] uppercase tracking-[0.22em] ${mute}`}>Traditional credit · one shared ledger</p>
            <h1 className={`font-display mt-5 max-w-xl text-balance text-5xl leading-[0.92] md:text-6xl ${ink}`}>
              Simplify your khata
            </h1>
            <p className={`mt-5 max-w-md text-pretty text-[16px] leading-relaxed ${mute}`}>
              One running account for shopkeeper and customer. The bill is posted once, both sides see the
              same rupees, and the due date clears it.
            </p>
          </motion.div>
          <ol className={`mt-8 space-y-4 text-[15px] leading-relaxed ${mute}`}>
            <li>
              <span className="block text-[11px] tracking-[0.18em] uppercase opacity-70">1 · Post</span>
              The shopkeeper photographs a slip or raises a counter QR. That line is the khata.
            </li>
            <li>
              <span className="block text-[11px] tracking-[0.18em] uppercase opacity-70">2 · Share</span>
              The customer opens the same record — amount, note, and due date, not a reconstructed total.
            </li>
            <li>
              <span className="block text-[11px] tracking-[0.18em] uppercase opacity-70">3 · Settle</span>
              When the date arrives the balance is clear. Nothing waits for month-end arithmetic.
            </li>
          </ol>
          <LoginScanScene />
        </div>

        <div id="enter" className="scroll-mt-28 w-full max-w-md space-y-3 lg:max-w-none lg:justify-self-end">
            <button
              type="button"
              aria-label="Continue as Customer"
              className="flex w-full items-end justify-between rounded-[28px] bg-white p-6 text-left text-[#071428]"
              onClick={() => void enterAs('customer')}
            >
              <span>
                <span className={`inline-flex items-center gap-2 text-[13px] ${light ? 'text-[#071428]' : 'text-[#123056]'}`}>
                  <GoogleMark /> Continue as
                </span>
                <span className="mt-1 block font-display text-4xl">Customer</span>
              </span>
              <ArrowRight className="mb-1 size-5" />
            </button>
            <button
              type="button"
              aria-label="Continue as Shopkeeper"
              className="flex w-full items-end justify-between rounded-[28px] bg-primary p-6 text-left text-primary-foreground"
              onClick={() => void enterAs('shopkeeper')}
            >
              <span>
                <span className="inline-flex items-center gap-2 text-[13px] opacity-70">
                  <GoogleMark /> Continue as
                </span>
                <span className="mt-1 block font-display text-4xl">Shopkeeper</span>
              </span>
              <ArrowRight className="mb-1 size-5" />
            </button>
            <Button
              variant="ghost"
              className={`w-full ${light ? 'text-[#123056] hover:bg-[#071428]/8 hover:text-[#071428]' : 'text-white hover:bg-white/10 hover:text-white'}`}
              onClick={resetDemo}
            >
              <RotateCcw /> Reset demo data
            </Button>
            <p className="pt-2 text-center">
              <TermsLink
                className={
                  light
                    ? 'text-[#123056] decoration-[#123056]/40 hover:text-[#071428]'
                    : 'text-white/75 decoration-white/30 hover:text-white hover:decoration-white/70'
                }
              />
            </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6 pt-28">
        <p className={`text-[12px] uppercase tracking-[0.18em] ${mute}`}>On the counter</p>
        <h2 className={`mt-2 font-display text-3xl md:text-4xl ${ink}`}>The khata, as both sides read it</h2>
        <div className="mt-8 flex justify-center lg:justify-end">
          <HeroPhone />
        </div>
      </section>

      <LoginExplainer />
    </div>
  )
}

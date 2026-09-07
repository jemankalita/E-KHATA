import { AtmosphericBackdrop } from '@/components/AtmosphericBackdrop'
import { BrandWordmark } from '@/components/BrandLogo'
import { LoginExplainer, LoginSectionNav, useActiveLoginSection } from '@/components/LoginExplainer'
import { LoginScanScene } from '@/components/LoginScanScene'
import { TermsLink } from '@/components/TermsLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useKhata } from '@/hooks/useKhata'
import { useTheme } from '@/hooks/useTheme'
import { dashboardPath } from '@/lib/auth'
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const activeSection = useActiveLoginSection()
  const light = theme === 'light'

  useEffect(() => {
    if (!loading && profile) navigate(dashboardPath(profile.role), { replace: true })
  }, [loading, navigate, profile])

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

  return (
    <div className="relative min-h-svh bg-transparent text-white">
      <AtmosphericBackdrop />

      <header
        className={`sticky top-0 z-20 border-b backdrop-blur-md ${
          light ? 'border-black/5 bg-white/95 text-zinc-900' : 'border-white/10 bg-black/20 text-white'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <BrandWordmark className={light ? 'text-zinc-900' : 'text-white'} />
          <LoginSectionNav
            active={activeSection}
            tone={light ? 'bar' : 'sky'}
            className="hidden items-center gap-6 md:flex"
          />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={resetDemo}
              className={`inline-flex items-center gap-2 text-[13px] ${
                light ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/70 hover:text-white'
              }`}
            >
              <RotateCcw className="size-3.5" /> Reset demo
            </button>
          </div>
        </div>
        <LoginSectionNav
          active={activeSection}
          tone={light ? 'bar' : 'sky'}
          className="flex gap-5 overflow-x-auto px-6 pb-3 md:hidden"
        />
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 text-[13px] text-white [text-shadow:0_2px_14px_rgba(0,40,90,0.45)]">
            <Sparkles className="size-3.5" /> 1 · Choose how you enter
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] text-white [text-shadow:0_8px_32px_rgba(0,40,90,0.5)] md:text-7xl">
            Trust captured
            <span className="mt-2 block italic text-white">in a snap.</span>
          </h1>
          <p className="mt-5 font-display text-3xl text-white [text-shadow:0_4px_20px_rgba(0,40,90,0.45)]">e-Khata</p>
          <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white [text-shadow:0_2px_16px_rgba(0,40,90,0.45)]">
            Traditional store credit, written as a shared digital khata. Merchant, customer, one record. The
            shopkeeper posts each bill to an account.
          </p>
          <LoginScanScene />
        </div>

        <div className="space-y-3">
          {!configured ? (
            <p className="rounded-[20px] bg-black/25 px-4 py-3 text-sm text-white/90">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then enable Google in Supabase Auth.
            </p>
          ) : null}
          <button
            type="button"
            aria-label="Continue as Customer"
            className="flex w-full items-end justify-between rounded-[28px] bg-primary p-6 text-left text-primary-foreground"
            onClick={() => void enterAs('customer')}
          >
            <span>
              <span className="inline-flex items-center gap-2 text-[13px] opacity-70">
                <GoogleMark /> Continue as
              </span>
              <span className="mt-1 block font-display text-4xl">Customer</span>
            </span>
            <ArrowRight className="mb-1 size-5" />
          </button>
          <button
            type="button"
            aria-label="Continue as Shopkeeper"
            className="flex w-full items-end justify-between rounded-[28px] bg-white p-6 text-left text-zinc-900 dark:bg-card dark:text-foreground"
            onClick={() => void enterAs('shopkeeper')}
          >
            <span>
              <span className="inline-flex items-center gap-2 text-[13px] text-zinc-500 dark:text-muted-foreground">
                <GoogleMark /> Continue as
              </span>
              <span className="mt-1 block font-display text-4xl">Shopkeeper</span>
            </span>
            <ArrowRight className="mb-1 size-5" />
          </button>
          <Button variant="ghost" className="w-full text-white hover:bg-white/10 hover:text-white" onClick={resetDemo}>
            <RotateCcw /> Reset demo data
          </Button>
          <p className="pt-2 text-center">
            <TermsLink className="text-white/75 decoration-white/30 hover:text-white hover:decoration-white/70" />
          </p>
        </div>
      </section>

      <LoginExplainer />
    </div>
  )
}

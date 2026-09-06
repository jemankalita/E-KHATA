import { AtmosphericBackdrop } from '@/components/AtmosphericBackdrop'
import { BrandWordmark } from '@/components/BrandLogo'
import { LoginScanScene } from '@/components/LoginScanScene'
import { TermsLink } from '@/components/TermsLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { setRole, resetDemo } = useKhata()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-svh bg-transparent">
      <AtmosphericBackdrop />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BrandWordmark />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={resetDemo}
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" /> Reset demo
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 text-[13px] text-accent">
            <Sparkles className="size-3.5" /> 1 · Choose how you enter
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] text-foreground md:text-7xl">
            Trust captured
            <span className="mt-2 block italic text-primary">in a snap.</span>
          </h1>
          <p className="mt-5 font-display text-3xl text-foreground">e-Khata</p>
          <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            Traditional store credit, written as a shared digital khata. Merchant, customer, one record. The
            shopkeeper posts each bill to an account.
          </p>
          <LoginScanScene />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            aria-label="Continue as Customer"
            className="flex w-full items-end justify-between rounded-[28px] bg-primary p-6 text-left text-primary-foreground"
            onClick={() => {
              setRole('customer')
              navigate('/customer')
            }}
          >
            <span>
              <span className="block text-[13px] opacity-70">Continue as</span>
              <span className="mt-1 block font-display text-4xl">Customer</span>
            </span>
            <ArrowRight className="mb-1 size-5" />
          </button>
          <button
            type="button"
            aria-label="Continue as Shopkeeper"
            className="flex w-full items-end justify-between rounded-[28px] bg-card p-6 text-left text-foreground"
            onClick={() => {
              setRole('shopkeeper')
              navigate('/shopkeeper')
            }}
          >
            <span>
              <span className="block text-[13px] text-muted-foreground">Continue as</span>
              <span className="mt-1 block font-display text-4xl">Shopkeeper</span>
            </span>
            <ArrowRight className="mb-1 size-5" />
          </button>
          <Button variant="ghost" className="w-full" onClick={resetDemo}>
            <RotateCcw /> Reset demo data
          </Button>
          <p className="pt-2 text-center">
            <TermsLink />
          </p>
        </div>
      </div>
    </div>
  )
}

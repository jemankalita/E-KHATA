import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const roles = [
  {
    to: '/customer',
    kicker: 'Continue as',
    title: 'Customer',
    body: 'Open the selected account. See what it owes. Settlement clears on the due date.',
    tile: 'bg-iris-gleam text-pure',
  },
  {
    to: '/shop',
    kicker: 'Continue as',
    title: 'Shopkeeper',
    body: 'Photograph a bill or raise a counter QR, then post it to an account. Settlement runs automatically.',
    tile: 'bg-orchid-bloom text-void',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian text-cloud">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 sm:px-8">
        <p className="font-display text-[1.65rem] font-normal italic tracking-tight">e-khata</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">One ledger · two accounts</p>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-[1200px] items-center gap-16 px-5 pb-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="inline-flex rounded-full border border-white/15 bg-white/12 px-8 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-pure">
            1 · Choose how you enter
          </p>
          <h1 className="font-display mt-8 max-w-xl text-balance text-[38px] font-normal leading-[0.9] sm:text-[80px]">
            Traditional credit.{' '}
            <em className="italic text-cloud">Reimagined.</em>
          </h1>
          <p className="mt-6 max-w-md text-pretty text-lg font-light leading-relaxed text-ash">
            E-Khata posts each bill to a customer account. Settlement clears on the due date by itself.
            Customers open their own account — there is no customer QR path.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <Link
              key={role.to}
              to={role.to}
              aria-label={`${role.kicker} ${role.title}`}
              className={`flex min-h-[7.5rem] flex-col justify-between rounded-[30px] p-8 ${role.tile}`}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">{role.kicker}</span>
              <span className="flex items-end justify-between gap-4">
                <span>
                  <span className="font-display block text-[38px] font-normal leading-none italic">{role.title}</span>
                  <span className="mt-2 block max-w-xs text-sm font-light opacity-80">{role.body}</span>
                </span>
                <ArrowRight size={20} aria-hidden="true" className="mb-1 shrink-0" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

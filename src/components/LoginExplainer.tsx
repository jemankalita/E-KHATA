import { HERO_PHONE_LEDGER } from '@/lib/heroPhone'
import { sparkPath } from '@/lib/moneyGraph'
import { formatInr } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export const LOGIN_SECTIONS = [
  { id: 'how-it-works', label: 'The file' },
  { id: 'customers', label: 'Customers' },
  { id: 'shopkeepers', label: 'Shops' },
] as const

const stories = [
  {
    id: 'how-it-works',
    title: (
      <>
        Neighbourhood trust, as a <em className="italic">score</em>
      </>
    ),
    body: 'RuPay-on-UPI already pays with a bank card at any QR. What it cannot see is the regular who settles the kirana book. E-Khata scores that behaviour and shows every feature.',
    points: [
      { title: 'Write the khata', copy: 'Bills still post from a photo or counter QR. The ledger is the source, not a new pay rail.' },
      { title: 'Count real repayments', copy: 'Customer payments — full or partial — write the file. Due-date auto-close does not.' },
      { title: 'Hand a partner the reasons', copy: 'A 300–900 score plus days-to-settle, disputes, and stability. Queryable. Not a black box.' },
    ],
  },
  {
    id: 'customers',
    title: (
      <>
        The shops already know <em className="italic">you</em>
      </>
    ),
    body: 'Your score is local: this customer at this shop. Three confirmed settlements and the file opens. Until then you are a thin file, not a reject.',
    points: [
      { title: 'One score per shop', copy: 'Trust does not travel blindly across town. The file is the relationship.' },
      { title: 'You can dispute a line', copy: 'Corrections and disputes are part of the record a lender would want to see.' },
      { title: 'Pay down, not a product', copy: 'Clearing khata is repayment behaviour. E-Khata does not issue credit in this phase.' },
    ],
  },
  {
    id: 'shopkeepers',
    title: (
      <>
        Your book is the <em className="italic">underwrite</em>
      </>
    ),
    body: 'Keep selling. Each settlement is alternative data an NBFC could license later. You are not the lender. You already hold the signal.',
    points: [
      { title: 'See the file next to the due', copy: 'Open balances sit beside the score so collections and underwriting share one screen.' },
      { title: 'Correct a wrong amount', copy: 'A shopkeeper fix is a correction event, not a silent edit.' },
      { title: 'No balance-sheet lending', copy: 'Phase 2 would sit under an NBFC. This build stops at the data line on purpose.' },
    ],
  },
] as const

const files = [
  { name: 'Rahul Sharma', score: '831', band: 'strong' },
  { name: 'Aman Verma', score: '—', band: 'thin file' },
  { name: 'Priya Singh', score: '—', band: 'pending bill' },
] as const

export function useActiveLoginSection() {
  const [active, setActive] = useState<(typeof LOGIN_SECTIONS)[number]['id']>('how-it-works')

  useEffect(() => {
    const nodes = LOGIN_SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    )
    if (nodes.length === 0 || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const id = visible?.target.id
        if (id === 'how-it-works' || id === 'customers' || id === 'shopkeepers') {
          setActive(id)
        }
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.2, 0.5, 0.8] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return active
}

export function LoginSectionNav({
  active,
  className = '',
  tone = 'sky',
}: {
  active: (typeof LOGIN_SECTIONS)[number]['id']
  className?: string
  tone?: 'sky' | 'bar'
}) {
  return (
    <nav aria-label="On this page" className={className}>
      {LOGIN_SECTIONS.map((section) => {
        const on = active === section.id
        const color =
          tone === 'bar'
            ? on
              ? 'text-[#071428]'
              : 'text-[#123056] hover:text-[#071428]'
            : on
              ? 'text-white'
              : 'text-white/60 hover:text-white'
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`whitespace-nowrap px-2 text-[11px] uppercase tracking-[0.16em] transition-colors ${color}`}
          >
            {section.label}
          </a>
        )
      })}
    </nav>
  )
}

export function LoginExplainer() {
  const path = sparkPath([...HERO_PHONE_LEDGER.series], 320, 96)

  return (
    <div className="relative z-10 mx-auto max-w-6xl space-y-28 px-6 pb-28 pt-16 text-[#071428] dark:text-white">
      <section id="how-it-works" className="scroll-mt-28 grid gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <h2 className="max-w-xl font-display text-4xl leading-[0.95] text-balance md:text-6xl">{stories[0].title}</h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#123056] dark:text-white/70">{stories[0].body}</p>
        </div>
        <div className="landing-glass rounded-[28px] p-5">
          <p className="text-[12px] text-[#123056] dark:text-white/50">Rahul Sharma · Sharma Stores</p>
          <p className="mt-1 font-display text-5xl tabular-nums">831</p>
          <p className="text-[13px] text-accent">strong · khata-score-v1</p>
          <svg viewBox="0 0 320 96" className="mt-4 h-24 w-full" aria-hidden="true">
            <path d={path} className="hero-phone-spark" fill="none" stroke="currentColor" strokeWidth="2.2" />
          </svg>
        </div>
      </section>

      <ul className="grid gap-3 md:grid-cols-3">
        {stories[0].points.map((point) => (
          <li key={point.title} className="landing-glass rounded-[24px] p-5">
            <p className="flex items-center gap-2 font-display text-xl">
              {point.title}
              <ArrowRight className="size-3.5 opacity-50" />
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#123056] dark:text-white/65">{point.copy}</p>
          </li>
        ))}
      </ul>

      <section id="customers" className="scroll-mt-28 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="max-w-xl font-display text-4xl leading-[0.95] md:text-6xl">{stories[1].title}</h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#123056] dark:text-white/70">{stories[1].body}</p>
          <ul className="mt-8 space-y-3">
            {stories[1].points.map((point) => (
              <li key={point.title}>
                <p className="font-display text-xl">{point.title}</p>
                <p className="text-[14px] text-[#123056] dark:text-white/65">{point.copy}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] bg-[#071428] p-6 text-[#f3efe8] dark:bg-[#161618]">
          <p className="font-display text-2xl">Sharma Stores credit book</p>
          <div className="mt-6 space-y-4">
            {files.map((row) => (
              <div key={row.name} className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="text-[15px]">{row.name}</p>
                  <p className="text-[12px] tracking-[0.14em] text-white/50 uppercase">{row.band}</p>
                </div>
                <p className="font-display text-3xl tabular-nums">{row.score}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="shopkeepers" className="scroll-mt-28">
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">{stories[2].title}</h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#123056] dark:text-white/70">{stories[2].body}</p>
        <ul className="mt-10 grid gap-3 md:grid-cols-3">
          {stories[2].points.map((point) => (
            <li key={point.title} className="landing-glass rounded-[24px] p-5">
              <p className="flex items-center gap-2 font-display text-xl">
                {point.title}
                <ArrowRight className="size-3.5 opacity-50" />
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#123056] dark:text-white/65">{point.copy}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[32px] bg-gradient-to-b from-transparent to-black/25 px-6 py-16 text-center dark:to-black/40">
        <h2 className="font-display text-4xl md:text-6xl">Not a loan. A file.</h2>
        <p className="mx-auto mt-4 max-w-lg text-[16px] text-[#123056] dark:text-white/70">
          Phase 1 stops at the data line. An NBFC would have to stand behind any actual credit. Open the demo and
          read Rahul’s 831 at Sharma Stores.
        </p>
        <a
          href="#enter"
          className="mt-6 inline-flex rounded-full border border-[#071428]/20 bg-[#071428]/8 px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-[#071428] backdrop-blur-md dark:border-white/25 dark:bg-white/10 dark:text-white"
        >
          More about entering
        </a>
        <div className="landing-glass mx-auto mt-10 max-w-3xl rounded-[28px] p-6 text-left">
          <div className="flex flex-wrap justify-between gap-6">
            <div>
              <p className="text-[12px] text-[#123056] dark:text-white/50">Open khata</p>
              <p className="font-display text-3xl tabular-nums">{formatInr(HERO_PHONE_LEDGER.outstanding)}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#123056] dark:text-white/50">Scored file</p>
              <p className="font-display text-3xl tabular-nums">831</p>
              <p className="text-[13px] text-accent">After 3 confirmed settlements</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

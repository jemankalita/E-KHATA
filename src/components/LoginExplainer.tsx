import { HERO_PHONE_LEDGER } from '@/lib/heroPhone'
import { sparkPath } from '@/lib/moneyGraph'
import { formatInr } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export const LOGIN_SECTIONS = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'customers', label: 'Customers' },
  { id: 'shopkeepers', label: 'Shopkeepers' },
] as const

const stories = [
  {
    id: 'how-it-works',
    kicker: 'The shared ledger',
    title: (
      <>
        Monitor <em className="italic">khata</em> performance
      </>
    ),
    body: 'The shopkeeper posts each bill to an account. The customer sees the same line, the same due date, the same rupees. Nothing is reconstructed from a pile of slips.',
    points: [
      { title: 'Capture the bill', copy: 'Photograph a slip or raise a counter QR. The entry is written once.' },
      { title: 'Same record', copy: 'Merchant and customer read one khata — not two notebooks that drift apart.' },
      { title: 'Settle on the date', copy: 'When it is due, the balance is clear. No reconstruction from memory.' },
    ],
  },
  {
    id: 'customers',
    kicker: 'For the account holder',
    title: (
      <>
        See what the shop <em className="italic">wrote</em>
      </>
    ),
    body: 'Open the selected account. Every posted bill is already there. Settlement is the due date, not a surprise total.',
    points: [
      { title: 'Open your account', copy: 'No customer QR path — you walk into the ledger that belongs to you.' },
      { title: 'Read every bill', copy: 'Amounts, notes, and timing sit in one place you can check.' },
      { title: 'Clear it when due', copy: 'Pay against the same record the shopkeeper posted.' },
    ],
  },
  {
    id: 'shopkeepers',
    kicker: 'For the counter',
    title: (
      <>
        Post it in a <em className="italic">snap</em>
      </>
    ),
    body: 'Traditional store credit, kept as a digital khata. Photograph the bill, attach it to a customer, and keep selling.',
    points: [
      { title: 'Raise a QR or snap a bill', copy: 'The counter does not wait for a notebook to catch up.' },
      { title: 'One account per regular', copy: 'Each customer has a running record, not a pile of loose slips.' },
      { title: 'Watch what is open', copy: 'Outstanding credit stays visible until the due date clears it.' },
    ],
  },
] as const

const mix = [
  { name: 'Sharma Stores', current: 72, model: 80, tone: 'bg-[#1e1b16] dark:bg-[#d8cbb8]' },
  { name: 'Campus Canteen', current: 48, model: 55, tone: 'bg-[#5c5348] dark:bg-[#a89b88]' },
  { name: 'Green Mart', current: 34, model: 40, tone: 'bg-[#5f6f45] dark:bg-[#a3b084]' },
  { name: 'Cash on hand', current: 18, model: 25, tone: 'bg-[#c4a574]' },
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
    <div className="mx-auto max-w-6xl space-y-28 px-6 pb-28 pt-16 text-[#071428] dark:text-white">
      <section id="how-it-works" className="scroll-mt-28 grid gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#123056] dark:text-white/70">{stories[0].kicker}</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-[0.95] text-balance md:text-6xl">{stories[0].title}</h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#123056] dark:text-white/70">{stories[0].body}</p>
        </div>
        <div className="landing-glass rounded-[28px] p-5">
          <p className="text-[12px] text-[#123056] dark:text-white/50">Total outstanding</p>
          <p className="mt-1 font-display text-4xl tabular-nums">{formatInr(HERO_PHONE_LEDGER.outstanding)}</p>
          <p className="text-[13px] text-accent">{HERO_PHONE_LEDGER.growthLabel} this cycle</p>
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
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#123056] dark:text-white/70">{stories[1].kicker}</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-[0.95] md:text-6xl">{stories[1].title}</h2>
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
        <div className="landing-glass rounded-[28px] p-6">
          <p className="text-[12px] uppercase tracking-[0.16em] text-[#123056] dark:text-white/50">Where credit sits</p>
          <div className="mt-6 space-y-5">
            {mix.map((row) => (
              <div key={row.name}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span>{row.name}</span>
                  <span className="tabular-nums text-[#123056] dark:text-white/55">{row.current}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-white/10">
                  <span className={`absolute inset-y-0 left-0 rounded-full ${row.tone}`} style={{ width: `${row.current}%` }} />
                  <span
                    className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-zinc-900/50 dark:bg-white/70"
                    style={{ left: `${row.model}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="shopkeepers" className="scroll-mt-28">
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#123056] dark:text-white/70">{stories[2].kicker}</p>
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
        <h2 className="font-display text-4xl md:text-6xl">Forecast your settlement</h2>
        <p className="mx-auto mt-4 max-w-lg text-[16px] text-[#123056] dark:text-white/70">
          Model the due date before it arrives. See what is open today and what clears when the cycle ends.
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
              <p className="text-[12px] text-[#123056] dark:text-white/50">Current outstanding</p>
              <p className="font-display text-3xl tabular-nums">{formatInr(HERO_PHONE_LEDGER.outstanding)}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#123056] dark:text-white/50">After due date</p>
              <p className="font-display text-3xl tabular-nums">₹0</p>
              <p className="text-[13px] text-accent">Clears on {HERO_PHONE_LEDGER.nextSettlement}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

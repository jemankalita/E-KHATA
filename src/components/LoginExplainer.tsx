import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

export const LOGIN_SECTIONS = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'customers', label: 'Customers' },
  { id: 'shopkeepers', label: 'Shopkeepers' },
] as const

const stories = [
  {
    id: 'how-it-works',
    kicker: 'The shared ledger',
    title: 'One khata. Two sides.',
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
    title: 'See what the shop wrote.',
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
    title: 'Post it in a snap.',
    body: 'Traditional store credit, kept as a digital khata. Photograph the bill, attach it to a customer, and keep selling.',
    points: [
      { title: 'Raise a QR or snap a bill', copy: 'The counter does not wait for a notebook to catch up.' },
      { title: 'One account per regular', copy: 'Each customer has a running record, not a pile of loose slips.' },
      { title: 'Watch what is open', copy: 'Outstanding credit stays visible until the due date clears it.' },
    ],
  },
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
              ? 'text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-900'
            : on
              ? 'text-white'
              : 'text-white/60 hover:text-white'
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`whitespace-nowrap text-[12px] uppercase tracking-[0.16em] transition-colors ${color}`}
          >
            {section.label}
          </a>
        )
      })}
    </nav>
  )
}

export function LoginExplainer() {
  return (
    <div className="mx-auto max-w-6xl space-y-24 px-6 pb-28 pt-8">
      {stories.map((story) => (
        <section key={story.id} id={story.id} className="scroll-mt-28">
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/80 [text-shadow:0_1px_12px_rgba(0,40,90,0.35)]">
            {story.kicker}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] text-white [text-shadow:0_6px_28px_rgba(0,40,90,0.45)] md:text-6xl">
            {story.title}
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white [text-shadow:0_2px_16px_rgba(0,40,90,0.4)]">
            {story.body}
          </p>
          <ul className="mt-10 grid gap-3 md:grid-cols-3">
            {story.points.map((point) => (
              <li
                key={point.title}
                className="rounded-[24px] border border-white/15 bg-black/20 p-5 backdrop-blur-md"
              >
                <p className="flex items-center gap-2 font-display text-xl text-white">
                  {point.title}
                  <ArrowRight className="size-3.5 opacity-50" />
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/70">{point.copy}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

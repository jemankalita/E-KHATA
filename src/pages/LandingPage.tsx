import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, QrCode, Store } from 'lucide-react'
import { Icon3D } from '../components/Icon3D'
import { LivingBackdrop } from '../components/LivingBackdrop'
import { Card } from '../components/ui/Card'
import { motionTokens, springs } from '../lib/motion-tokens'
import { staggerContainer, useStaggerItem } from '../lib/useSafeMotion'

const HEADLINE = ['How', 'should', 'this', 'bill', 'enter', 'the', 'khata?']

const roles = [
  {
    to: '/shop',
    eyebrow: 'Shopkeeper',
    title: 'Open the counter',
    body: 'Photograph a bill or raise a Quick QR, then settle at month end.',
    icon: Store,
    accent: 'text-teal-500',
  },
  {
    to: '/customer',
    eyebrow: 'Customer',
    title: 'Open my khata',
    body: 'See what you owe, scan the shop QR, confirm on your own phone.',
    icon: QrCode,
    accent: 'text-gold-400',
  },
]

const steps = [
  { who: 'Shopkeeper', title: 'Capture the bill', body: 'Photo OCR or Quick QR. Items match a small kirana catalog.' },
  { who: 'Customer', title: 'Scan the same QR', body: 'A phone camera opens the confirm page. No app install.' },
  { who: 'Both', title: 'Khata updates live', body: 'The amount rolls onto the ledger. A Hindi voice line confirms.' },
]

function Headline() {
  const reduce = useReducedMotion()

  return (
    <motion.h1
      variants={staggerContainer(0.055, 0.08)}
      initial="hidden"
      animate="visible"
      className="font-display mx-auto mt-4 max-w-2xl text-balance text-[2.5rem] leading-[1.08] sm:text-6xl"
    >
      {HEADLINE.map((word) => (
        <motion.span
          key={word}
          variants={{
            hidden: { opacity: 0, y: reduce ? 0 : motionTokens.distance.md, filter: reduce ? 'none' : 'blur(6px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={springs.gentle}
          className="mr-[0.28em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}

function RoleCards() {
  const item = useStaggerItem()

  return (
    <motion.div
      variants={staggerContainer(0.08, 0.42)}
      initial="hidden"
      animate="visible"
      className="mt-3 grid gap-3 sm:grid-cols-2"
    >
      {roles.map((role) => {
        const Icon = role.icon
        return (
          <motion.div key={role.to} variants={item} transition={springs.gentle}>
            <Link
              to={role.to}
              className="group flex h-full flex-col rounded-2xl border border-black/[0.07] bg-ink-950/70 px-4 py-4 text-left transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_44px_-28px_rgba(28,28,25,0.5)] motion-reduce:hover:translate-y-0"
            >
              <span className="flex items-center gap-2">
                <Icon size={16} aria-hidden="true" className={role.accent} />
                <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${role.accent}`}>
                  {role.eyebrow}
                </span>
              </span>
              <span className="mt-2 block font-medium text-paper-50">{role.title}</span>
              <span className="mt-1 block text-pretty text-sm text-paper-400">{role.body}</span>
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="mt-4 text-paper-400 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-paper-100 motion-reduce:group-hover:translate-x-0"
              />
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function Steps() {
  const item = useStaggerItem(motionTokens.distance.lg)

  return (
    <motion.ol
      variants={staggerContainer(0.09)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="mx-auto mt-14 grid gap-4 text-left sm:mt-16 sm:grid-cols-3"
    >
      {steps.map((step, index) => (
        <motion.li key={step.title} variants={item} transition={springs.gentle}>
          <Card className="h-full p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-400">{step.who}</p>
              <span className="tabular grid h-6 w-6 place-items-center rounded-full bg-teal-400/10 text-[11px] font-semibold text-teal-500">
                {index + 1}
              </span>
            </div>
            <h2 className="mt-2 text-pretty font-medium">{step.title}</h2>
            <p className="mt-2 text-pretty text-sm text-paper-400">{step.body}</p>
          </Card>
        </motion.li>
      ))}
    </motion.ol>
  )
}

export function LandingPage() {
  const reduce = useReducedMotion()
  const fade = { opacity: 0, y: reduce ? 0 : motionTokens.distance.sm }

  return (
    <div className="relative min-h-screen">
      <LivingBackdrop />
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6">
        <p className="font-display text-2xl">E-Khata</p>
        <p className="text-sm text-paper-400">Kirana credit, captured from the bill</p>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6 text-center sm:pt-14">
        <motion.p
          initial={fade}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.gentle}
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400"
        >
          Two roles. One ledger.
        </motion.p>

        <Headline />

        <motion.p
          initial={fade}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.gentle, delay: 0.32 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-base text-paper-200 sm:text-lg"
        >
          Shopkeepers raise a QR for an exact amount. Customers scan it on their phone. The rupee is added to E-Khata —
          not another wallet.
        </motion.p>

        <div className="relative mx-auto mt-10 max-w-xl">
          <Icon3D src="/icons3d/wallet.svg" alt="" className="absolute -left-16 -top-10 hidden h-24 w-24 lg:block" />
          <Icon3D src="/icons3d/qr.svg" alt="" className="absolute -right-16 top-6 hidden h-24 w-24 lg:block" />
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : motionTokens.scale.subtle }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springs.gentle, delay: 0.36 }}
            className="rounded-[32px] border border-black/[0.08] bg-white/80 px-3 py-3 shadow-[0_20px_60px_-36px_rgba(28,28,25,0.45)] backdrop-blur-md sm:px-4"
          >
            <p className="px-1 text-left text-sm text-paper-400">Choose a path</p>
            <RoleCards />
          </motion.div>
        </div>

        <Steps />
      </main>
    </div>
  )
}

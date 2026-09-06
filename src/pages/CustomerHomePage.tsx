import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { SvgBackdrop } from '../components/SvgBackdrop'
import { RockerMoney } from '../components/RockerMoney'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDateTime, formatRupee } from '../lib/format'
import { springs } from '../lib/motion-tokens'
import { staggerContainer, useStaggerItem } from '../lib/useSafeMotion'
import { useKhata } from '../store/KhataStore'

export function CustomerHomePage() {
  const inputId = useId()
  const { customers, transactions } = useKhata()
  const [lookup, setLookup] = useState(customers[0]?.phone ?? '')
  const item = useStaggerItem()

  const customer = useMemo(() => {
    const cleaned = lookup.replace(/\s+/g, '')
    if (!cleaned) return undefined
    return customers.find((entry) => entry.phone === cleaned || entry.id === cleaned)
  }, [customers, lookup])

  const rows = transactions.filter((tx) => tx.customerId === customer?.id)

  return (
    <div className="relative min-h-screen">
      <SvgBackdrop />
      <main className="mx-auto max-w-lg px-4 pb-16 pt-6">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-paper-400 transition-[color] duration-150 hover:text-paper-100"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          E-Khata
        </Link>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Customer</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">My khata</h1>
        <p className="mt-2 text-pretty text-paper-400">
          Find yourself by phone or customer ID. When a shopkeeper shows a QR, scan it — your phone opens the confirm
          page.
        </p>

        <div className="mt-6 text-sm">
          <label
            htmlFor={inputId}
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-400"
          >
            Phone or customer ID
          </label>
          <input
            id={inputId}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className="min-h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 tabular transition-[border-color] duration-150 focus:border-teal-400"
            value={lookup}
            onChange={(event) => setLookup(event.target.value)}
            placeholder="9876543210"
          />
        </div>

        {customer ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={springs.gentle}>
              <Card className="mt-6 p-5 sm:p-6">
                <p className="text-paper-400">{customer.name}</p>
                <RockerMoney
                  amount={customer.currentBalance}
                  label="Your outstanding khata"
                  className="mt-2 text-4xl sm:text-5xl"
                />
                <p className="mt-2 text-sm text-paper-400">Outstanding on this khata</p>
              </Card>
            </motion.div>

            {rows.length === 0 ? (
              <EmptyState
                className="mt-6"
                title="No bills yet"
                body="Scan a shop QR to add the first one. It appears here the moment you confirm."
              />
            ) : (
              <motion.ul
                variants={staggerContainer()}
                initial="hidden"
                animate="visible"
                className="mt-6 space-y-3"
              >
                {rows.map((tx) => (
                  <motion.li
                    key={tx.id}
                    variants={item}
                    transition={springs.gentle}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{tx.merchantName}</p>
                      <p className="text-xs text-paper-400">{formatDateTime(tx.timestamp)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular font-medium">{formatRupee(tx.amount)}</p>
                      <StatusBadge className="mt-1" tone={tx.status}>
                        {tx.status}
                      </StatusBadge>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </>
        ) : (
          <EmptyState
            className="mt-6"
            title="No customer matches that"
            body="Try a registered phone number such as 9876543210, or a customer ID like cust-aarav."
          />
        )}

        <Link to="/" className="mt-8 inline-block">
          <PrimaryButton variant="secondary">Back to roles</PrimaryButton>
        </Link>
      </main>
    </div>
  )
}

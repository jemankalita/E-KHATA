import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { RockerMoney } from '../components/RockerMoney'
import { SuccessBurst } from '../components/SuccessBurst'
import { confirmationLine } from '../lib/voice'
import { formatRupee } from '../lib/format'
import { motionTokens, springs } from '../lib/motion-tokens'
import { useKhata } from '../store/KhataStore'

/**
 * Starts at the pre-commit balance and steps to the new one after paint, so the
 * digit reels visibly roll instead of rendering the final number immediately.
 */
function useRollingBalance(from: number, to: number, seq: number): number {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? to : from)

  useEffect(() => {
    if (reduce) {
      setShown(to)
      return
    }
    setShown(from)
    const id = window.setTimeout(() => setShown(to), 220)
    return () => window.clearTimeout(id)
  }, [from, to, seq, reduce])

  return shown
}

export function SuccessPage() {
  const { lastTransaction, lastCommit, customers, voiceSource } = useKhata()
  const reduce = useReducedMotion()

  const customer = customers.find((entry) => entry.id === lastCommit?.customerId)
  const balance = useRollingBalance(lastCommit?.previousBalance ?? 0, lastCommit?.balance ?? 0, lastCommit?.seq ?? 0)

  if (!lastTransaction || !lastCommit) {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          title="No confirmation yet"
          body="Nothing has been added to the khata in this session. Raise a QR and let the customer confirm it."
          action={
            <Link to="/shop">
              <PrimaryButton>Back to dashboard</PrimaryButton>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div className="relative mx-auto h-20 w-20">
        <SuccessBurst seed={lastCommit.seq} />
        <motion.div
          initial={{ scale: reduce ? 1 : 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springs.bouncy}
          className="relative grid h-20 w-20 place-items-center rounded-full bg-teal-400 text-white shadow-[0_18px_40px_-20px_rgba(11,106,99,0.8)]"
        >
          <Check size={36} aria-hidden="true" />
        </motion.div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">Scan complete</p>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl">Added to E-Khata</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : motionTokens.distance.md }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.gentle, delay: 0.08 }}
      >
        <Card className="p-5 text-left sm:p-6">
          <p className="text-paper-400">Updated balance</p>
          <RockerMoney amount={balance} label="Updated balance" className="mt-2 text-4xl sm:text-5xl" />
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-paper-400">Just added</dt>
              <dd className="tabular font-medium">{formatRupee(lastTransaction.amount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-paper-400">Customer</dt>
              <dd className="min-w-0 truncate">{customer?.name ?? 'Unknown'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-paper-400">Merchant</dt>
              <dd className="min-w-0 truncate">{lastTransaction.merchantName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-paper-400">Reference</dt>
              <dd className="tabular">{lastTransaction.referenceId}</dd>
            </div>
          </dl>
        </Card>
      </motion.div>

      <Card className="p-5 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-400">Voice confirmation</p>
        <p className="mt-2 text-pretty text-paper-100">{confirmationLine(lastTransaction.amount)}</p>
        <p className="mt-2 text-xs text-paper-400">Source: {voiceSource ?? 'pending'}</p>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link to="/shop/ledger" className="block">
          <PrimaryButton className="w-full">View ledger</PrimaryButton>
        </Link>
        <Link to="/shop" className="block">
          <PrimaryButton variant="secondary" className="w-full">
            Back to counter
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}

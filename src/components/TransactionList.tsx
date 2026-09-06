import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { springs } from '../lib/motion-tokens'
import { staggerContainer, useStaggerItem } from '../lib/useSafeMotion'
import { formatDateTime, formatRupee } from '../lib/format'
import type { Transaction } from '../legacy/types'
import { EmptyState } from './ui/EmptyState'
import { PrimaryButton } from './ui/PrimaryButton'
import { StatusBadge } from './ui/StatusBadge'

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const item = useStaggerItem()

  if (transactions.length === 0) {
    return (
      <EmptyState
        className="mt-4"
        title="Nothing on the khata yet"
        body="Photograph a bill or post an amount — the first entry lands here on the selected account."
        action={
          <Link to="/shop/quick-qr">
            <PrimaryButton>Post to account</PrimaryButton>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <motion.ul
        variants={staggerContainer()}
        initial="hidden"
        animate="visible"
        className="mt-2 divide-y divide-black/[0.06]"
      >
        {transactions.map((tx) => (
          <motion.li
            key={tx.id}
            variants={item}
            transition={springs.gentle}
            className="flex items-start gap-3 py-4 sm:items-center sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-paper-50">{tx.merchantName}</p>
              <p className="truncate text-sm text-paper-400">
                {tx.items.map((entry) => entry.name).join(', ') || 'Amount only'} · {tx.referenceId}
              </p>
              <p className="text-xs text-paper-400">{formatDateTime(tx.timestamp)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tabular font-semibold text-paper-50">{formatRupee(tx.amount)}</p>
              <StatusBadge className="mt-1" tone={tx.status}>
                {tx.status}
              </StatusBadge>
            </div>
          </motion.li>
        ))}
      </motion.ul>
      <p className="pt-3 text-right text-sm">
        <Link to="/shop/ledger" className="font-medium text-teal-400 hover:text-teal-500">
          Open full ledger
        </Link>
      </p>
    </>
  )
}

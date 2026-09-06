import { motion } from 'motion/react'
import { springs } from '../lib/motion-tokens'
import { staggerContainer, useStaggerItem } from '../lib/useSafeMotion'
import { formatDateTime, formatRupee } from '../lib/format'
import type { Transaction } from '../types'
import { StatusBadge } from './ui/StatusBadge'

function itemSummary(tx: Transaction): string {
  return tx.items.map((item) => item.name).join(', ') || '—'
}

function LedgerCards({ rows }: { rows: Transaction[] }) {
  const item = useStaggerItem()

  return (
    <motion.ul
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="divide-y divide-black/[0.06] md:hidden"
    >
      {rows.map((tx) => (
        <motion.li key={tx.id} variants={item} transition={springs.gentle} className="space-y-2 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-paper-50">{tx.merchantName}</p>
              <p className="text-xs text-paper-400">{formatDateTime(tx.timestamp)}</p>
            </div>
            <p className="tabular shrink-0 font-semibold">{formatRupee(tx.amount)}</p>
          </div>
          <p className="text-pretty text-sm text-paper-300">{itemSummary(tx)}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="tabular text-xs text-paper-400">Ref {tx.referenceId}</span>
            <StatusBadge tone={tx.status}>{tx.status}</StatusBadge>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}

function LedgerRows({ rows }: { rows: Transaction[] }) {
  return (
    <div className="hidden md:block">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Khata entries for the selected customer</caption>
        <thead className="bg-black/[0.03] text-[11px] uppercase tracking-[0.14em] text-paper-400">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              When
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Store
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Items
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Ref
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id} className="border-t border-black/[0.06]">
              <td className="whitespace-nowrap px-4 py-3 text-paper-300">{formatDateTime(tx.timestamp)}</td>
              <td className="px-4 py-3">{tx.merchantName}</td>
              <td className="max-w-[180px] truncate px-4 py-3 text-paper-300">{itemSummary(tx)}</td>
              <td className="tabular px-4 py-3 text-paper-300">{tx.referenceId}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={tx.status}>{tx.status}</StatusBadge>
              </td>
              <td className="tabular px-4 py-3 text-right font-medium">{formatRupee(tx.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LedgerTable({ rows }: { rows: Transaction[] }) {
  return (
    <>
      <LedgerCards rows={rows} />
      <LedgerRows rows={rows} />
    </>
  )
}

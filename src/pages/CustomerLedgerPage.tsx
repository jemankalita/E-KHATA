import { StatusBadge } from '@/components/StatusBadge'
import { VerificationPanel } from '@/components/VerificationPanel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useKhata } from '@/hooks/useKhata'
import { formatDateTime, formatInr } from '@/lib/utils'
import type { Transaction } from '@/types'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function CustomerLedgerPage() {
  const { state } = useKhata()
  const location = useLocation()
  const requested = (location.state as { openId?: string } | null)?.openId
  const [openId, setOpenId] = useState<string | null>(requested ?? null)

  const openTxs = state.transactions.filter((tx) => !tx.settled)
  const settledTxs = state.transactions.filter((tx) => tx.settled)
  const selected = state.transactions.find((tx) => tx.id === openId) ?? null

  const groups = useMemo(() => groupByDay([...openTxs]), [openTxs])

  return (
    <div>
      <p className="text-[13px] text-accent">Digital ledger</p>
      <h1 className="mt-2 max-w-2xl font-display text-5xl leading-[1.05] text-foreground">
        You have {openTxs.length} khata entries.
      </h1>
      <p className="mt-3 rounded-[20px] bg-primary/15 px-4 py-3 text-[14px] text-primary">
        Both parties share the same record before it hits your balance.
      </p>

      <div className="relative mt-10">
        <div className="absolute top-2 bottom-2 left-[7px] w-px bg-border" />
        {openTxs.length === 0 ? (
          <p className="rounded-[18px] border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No open khata entries. Settle complete.
          </p>
        ) : (
          Object.entries(groups).map(([label, rows]) => (
            <section key={label} className="mb-8">
              <h2 className="mb-4 pl-8 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                {label}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {rows.map((tx) => (
                  <motion.button
                    key={tx.id}
                    type="button"
                    onClick={() => setOpenId(tx.id)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex w-full gap-4 pl-8 text-left"
                  >
                    <span className="absolute top-2 left-0 size-[15px] rounded-full border-2 border-primary bg-background" />
                    <div className="flex-1 rounded-[24px] bg-card px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-foreground">{tx.merchant}</p>
                          <p className="text-[13px] text-muted-foreground">{tx.category}</p>
                        </div>
                        <p className="font-mono text-foreground">{formatInr(tx.amount)}</p>
                      </div>
                      <div className="mt-2">
                        <StatusBadge status={tx.status} source={tx.source} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {settledTxs.length > 0 ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {settledTxs.length} settled {settledTxs.length === 1 ? 'entry' : 'entries'} archived this session.
        </p>
      ) : null}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setOpenId(null)}>
        {selected ? <LedgerDetail transaction={selected} /> : null}
      </Dialog>
    </div>
  )
}

function LedgerDetail({ transaction }: { transaction: Transaction }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{transaction.merchant}</DialogTitle>
        <DialogDescription>{formatInr(transaction.amount)}</DialogDescription>
      </DialogHeader>
      <dl className="mt-4 space-y-2.5 text-sm">
        <Detail label="Transaction ID" value={transaction.id} mono />
        <Detail label="Merchant" value={transaction.merchant} />
        <Detail
          label="Items"
          value={transaction.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
        />
        <Detail label="Amount" value={formatInr(transaction.amount)} />
        <Detail label="Timestamp" value={formatDateTime(transaction.timestamp)} />
        <Detail label="Transaction source" value={transaction.source} />
        <Detail label="Verification status" value={transaction.status === 'verified' ? 'Verified' : 'Pending'} />
      </dl>
      {transaction.source === 'QR' ? (
        <div className="mt-5">
          <VerificationPanel verification={transaction.verification} />
        </div>
      ) : null}
    </DialogContent>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? 'font-mono text-right text-foreground' : 'text-right text-foreground'}>{value}</dd>
    </div>
  )
}

function groupByDay(txs: Transaction[]): Record<string, Transaction[]> {
  const today = new Date()
  const todayKey = today.toDateString()
  const groups: Record<string, Transaction[]> = {}
  for (const tx of txs) {
    const d = new Date(tx.timestamp)
    const label = d.toDateString() === todayKey ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    groups[label] = groups[label] ?? []
    groups[label].push(tx)
  }
  return groups
}

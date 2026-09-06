import { useState } from 'react'
import { CustomerSelect } from '../components/CustomerSelect'
import { RockerMoney } from '../components/RockerMoney'
import { SuccessBurst } from '../components/SuccessBurst'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { formatDate, formatRupee } from '../lib/format'
import { useKhata } from '../store/KhataStore'

export function SettlementPage() {
  const { transactions, selectedCustomer, settle } = useKhata()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settled, setSettled] = useState<number | null>(null)

  const openRows = transactions.filter(
    (tx) => tx.customerId === selectedCustomer.id && tx.settlementState === 'open',
  )

  async function onSettle() {
    setBusy(true)
    setError(null)
    try {
      const result = await settle()
      setSettled(result.settledAmount)
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not settle this khata.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Month end</p>
        <h2 className="font-display mt-1 text-3xl sm:text-4xl">Settlement</h2>
        <p className="mt-2 text-pretty text-sm text-paper-400">
          Clearing marks every open entry settled and resets the balance to zero.
        </p>
      </div>

      <CustomerSelect />

      <Card className="p-5 sm:p-8">
        <p className="text-paper-400">Outstanding</p>
        <RockerMoney
          amount={selectedCustomer.currentBalance}
          label={`${selectedCustomer.name} outstanding`}
          className="mt-2 text-4xl sm:text-5xl"
        />
        <p className="mt-3 text-pretty text-sm text-paper-400">
          {openRows.length} open {openRows.length === 1 ? 'entry' : 'entries'} on {selectedCustomer.name} · next due{' '}
          {formatDate(selectedCustomer.nextSettlementDate)}
        </p>
        {error ? (
          <p role="alert" className="mt-4 rounded-2xl bg-clay-400/10 px-3 py-2 text-sm text-clay-400">
            {error}
          </p>
        ) : null}
        <PrimaryButton
          className="mt-6 w-full sm:w-auto"
          onClick={() => void onSettle()}
          disabled={busy || selectedCustomer.currentBalance === 0}
        >
          {busy ? 'Settling…' : 'Settle E-Khata'}
        </PrimaryButton>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-paper-400">Breakdown</h3>
        {openRows.length === 0 ? (
          <EmptyState
            className="mt-3 border-0 bg-transparent px-0 py-6"
            title="Nothing open"
            body="This khata is already clear. New bills appear here as soon as they are confirmed."
          />
        ) : (
          <ul className="mt-3 divide-y divide-black/[0.06]">
            {openRows.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0 truncate">{tx.merchantName}</span>
                <span className="tabular shrink-0">{formatRupee(tx.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={open} title="Settlement success" onClose={() => setOpen(false)}>
        <div className="relative">
          {open ? <SuccessBurst seed={settled ?? 1} count={12} /> : null}
          <p className="relative text-pretty text-paper-200">
            {formatRupee(settled ?? 0)} cleared from {selectedCustomer.name}'s E-Khata. The balance is now zero.
          </p>
        </div>
        <PrimaryButton className="mt-5 w-full" onClick={() => setOpen(false)}>
          Done
        </PrimaryButton>
      </Modal>
    </div>
  )
}

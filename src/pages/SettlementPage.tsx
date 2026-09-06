import { CustomerSelect } from '../components/CustomerSelect'
import { RockerMoney } from '../components/RockerMoney'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate, formatRupee } from '../lib/format'
import { useKhata } from '../store/KhataStore'

export function SettlementPage() {
  const { transactions, selectedCustomer } = useKhata()

  const openRows = transactions.filter(
    (tx) => tx.customerId === selectedCustomer.id && tx.settlementState === 'open',
  )

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Automatic</p>
        <h2 className="font-display mt-1 text-3xl sm:text-4xl">Settlement</h2>
        <p className="mt-2 text-pretty text-sm text-paper-400">
          Open entries clear automatically on the due date. There is no manual settle button.
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
          {openRows.length} open {openRows.length === 1 ? 'entry' : 'entries'} on {selectedCustomer.name}. Last
          automatic settlement{' '}
          {selectedCustomer.lastSettlementDate ? formatDate(selectedCustomer.lastSettlementDate) : 'has not run yet'} ·
          next due {formatDate(selectedCustomer.nextSettlementDate)}.
        </p>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-paper-400">Open until due date</h3>
        {openRows.length === 0 ? (
          <EmptyState
            className="mt-3 border-0 bg-transparent px-0 py-6"
            title="Nothing open"
            body="This account is clear. New bills stay open until the next automatic settlement."
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
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CustomerSelect } from '../components/CustomerSelect'
import { SvgBackdrop } from '../components/SvgBackdrop'
import { RockerMoney } from '../components/RockerMoney'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDate, formatDateTime, formatRupee } from '../lib/format'
import { useKhata } from '../store/KhataStore'

export function CustomerHomePage() {
  const { selectedCustomer, transactions } = useKhata()
  const rows = transactions.filter((tx) => tx.customerId === selectedCustomer.id)

  return (
    <div className="relative min-h-screen">
      <SvgBackdrop />
      <main className="mx-auto max-w-lg px-4 pb-16 pt-6">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-paper-400 hover:text-paper-100"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          E-Khata
        </Link>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Customer</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">My khata</h1>
        <p className="mt-2 text-pretty text-paper-400">
          This screen is the selected account. Open bills stay here until settlement runs on the due date.
        </p>

        <div className="mt-6">
          <CustomerSelect />
        </div>

        <Card className="mt-6 p-5 sm:p-6">
          <p className="text-paper-400">{selectedCustomer.name}</p>
          <RockerMoney
            amount={selectedCustomer.currentBalance}
            label="Your outstanding khata"
            className="mt-2 text-4xl sm:text-5xl"
          />
          <p className="mt-2 text-sm text-paper-400">
            Outstanding on this account · next automatic settlement {formatDate(selectedCustomer.nextSettlementDate)}
          </p>
        </Card>

        {rows.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No bills yet"
            body="When the shopkeeper posts a bill to this account, it appears here."
          />
        ) : (
          <ul className="mt-6 space-y-3">
            {rows.map((tx) => (
              <li
                key={tx.id}
                className="flex items-start justify-between gap-3 rounded-[16px] bg-graphite px-4 py-3"
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
              </li>
            ))}
          </ul>
        )}

        <Link to="/" className="mt-8 inline-block">
          <PrimaryButton variant="secondary">Back to roles</PrimaryButton>
        </Link>
      </main>
    </div>
  )
}

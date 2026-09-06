import { Link } from 'react-router-dom'
import { CustomerSelect } from '../components/CustomerSelect'
import { LedgerTable } from '../components/LedgerTable'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { formatRupee } from '../lib/format'
import { useKhata } from '../store/KhataStore'

export function LedgerPage() {
  const { transactions, selectedCustomer, selectedCustomerId } = useKhata()
  const rows = transactions.filter((tx) => tx.customerId === selectedCustomerId)
  const open = rows.filter((tx) => tx.settlementState === 'open')
  const openTotal = open.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Bahi</p>
        <h2 className="font-display mt-1 text-3xl sm:text-4xl">Ledger</h2>
        <p className="mt-2 text-pretty text-sm text-paper-400">
          {rows.length} {rows.length === 1 ? 'entry' : 'entries'} for {selectedCustomer.name} ·{' '}
          <span className="tabular">{formatRupee(openTotal)}</span> still open
        </p>
      </div>

      <CustomerSelect />

      {rows.length === 0 ? (
        <EmptyState
          title={`No entries for ${selectedCustomer.name}`}
          body="Every confirmed QR lands here, newest first. Switch customer above or add the first bill."
          action={
            <Link to="/shop/quick-qr">
              <PrimaryButton>Raise a Quick QR</PrimaryButton>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <LedgerTable rows={rows} />
        </Card>
      )}
    </div>
  )
}

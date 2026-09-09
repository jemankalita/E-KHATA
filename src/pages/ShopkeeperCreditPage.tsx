import { CreditScorePanel } from '@/components/CreditScorePanel'
import { creditReportFor } from '@/lib/creditScore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKhata } from '@/hooks/useKhata'
import { remainingOnBill } from '@/lib/creditScore/fromKhataState'
import { formatInr } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export function ShopkeeperCreditPage() {
  const { state, correctBill } = useKhata()
  const [params] = useSearchParams()
  const customerName = params.get('customer') ?? ''
  const report = useMemo(
    () => creditReportFor(state, customerName, state.merchant.name),
    [customerName, state],
  )
  const openBills = state.transactions.filter(
    (tx) => tx.customerName === customerName && tx.merchant === state.merchant.name && remainingOnBill(tx) > 0,
  )

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="mt-2 font-display text-4xl text-foreground">Credit file</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Same breakdown a partner gets from the score API. E-Khata does not lend.
        </p>
        <Button asChild variant="secondary" className="mt-6">
          <Link to="/shopkeeper">Back to the book</Link>
        </Button>
        {openBills.length > 0 ? (
          <section className="mt-8 space-y-3">
            <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Correct an open bill</h2>
            {openBills.map((tx) => (
              <CorrectionRow
                key={tx.id}
                id={tx.id}
                amount={tx.amount}
                remaining={remainingOnBill(tx)}
                onSave={correctBill}
              />
            ))}
          </section>
        ) : null}
      </div>
      {customerName ? <CreditScorePanel report={report} /> : null}
    </div>
  )
}

function CorrectionRow({
  id,
  amount,
  remaining,
  onSave,
}: {
  id: string
  amount: number
  remaining: number
  onSave: (id: string, amount: number) => void
}) {
  const [value, setValue] = useState(String(amount))
  return (
    <form
      className="rounded-[24px] bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault()
        const next = Number(value)
        if (Number.isFinite(next) && next > 0) onSave(id, next)
      }}
    >
      <p className="text-sm text-foreground">{id}</p>
      <p className="text-xs text-muted-foreground">Remaining {formatInr(remaining)}</p>
      <div className="mt-3 flex gap-2">
        <Input
          aria-label={`Correct amount for ${id}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          inputMode="numeric"
        />
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

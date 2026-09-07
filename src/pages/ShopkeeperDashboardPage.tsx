import { Button } from '@/components/ui/button'
import { openBalancesByCustomer } from '@/lib/customerBalances'
import { formatPayBy, isOverdue } from '@/lib/payBy'
import { useKhata } from '@/hooks/useKhata'
import { formatInr, greetingForHour } from '@/lib/utils'
import { Camera, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export function ShopkeeperDashboardPage() {
  const { state } = useKhata()
  const navigate = useNavigate()
  const greeting = greetingForHour(new Date().getHours())
  const balances = useMemo(
    () => openBalancesByCustomer(state.transactions, state.merchant.name),
    [state.merchant.name, state.transactions],
  )
  const notices = state.notices.filter((notice) => notice.kind === 'settled' || notice.kind === 'auto').slice(0, 3)
  const dueCount = balances.filter((row) => row.payBy && isOverdue(row.payBy)).length

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[13px] text-accent">{greeting}</p>
      <h1 className="mt-1 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">
        {state.merchant.name}
      </h1>

      <section className="mt-8 rounded-[28px] bg-card p-6">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">To collect</p>
        <p className="mt-2 font-display text-4xl tabular-nums text-foreground md:text-5xl">
          {formatInr(balances.reduce((sum, row) => sum + row.amount, 0))}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {balances.length} {balances.length === 1 ? 'customer' : 'customers'} with open dues
          {dueCount > 0 ? ` · ${dueCount} overdue` : ''}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate('/shopkeeper/create')}>
            <Plus /> New bill
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/shopkeeper/upload')}>
            <Camera /> Scan bill
          </Button>
        </div>
      </section>

      {notices.length > 0 ? (
        <section className="mt-4 space-y-2" aria-live="polite">
          {notices.map((notice) => (
            <p
              key={notice.id}
              className="rounded-[20px] bg-primary/12 px-4 py-3 text-sm text-foreground"
            >
              {notice.customerName} settled {formatInr(notice.amount)}
              <span className="text-muted-foreground"> · {notice.merchant}</span>
            </p>
          ))}
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Who still has to pay
        </h2>
        {balances.length === 0 ? (
          <p className="rounded-[24px] bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No open customer balances. Everyone is clear.
          </p>
        ) : (
          <ul className="space-y-2">
            {balances.map((row) => {
              const overdue = row.payBy ? isOverdue(row.payBy) : false
              return (
                <li
                  key={row.customerName}
                  className="flex items-center justify-between gap-4 rounded-[24px] bg-card px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-foreground">{row.customerName}</p>
                    <p className={`text-sm ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {row.payBy ? formatPayBy(row.payBy) : 'No pay-by date'}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-2xl tabular-nums text-foreground">
                    {formatInr(row.amount)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

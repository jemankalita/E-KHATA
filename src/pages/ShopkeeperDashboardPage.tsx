import { MoneyGraph } from '@/components/MoneyGraph'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { cumulativeSeries } from '@/lib/moneyGraph'
import { formatInr, greetingForHour } from '@/lib/utils'
import { Users, Clock, Plus, Camera } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export function ShopkeeperDashboardPage() {
  const { state } = useKhata()
  const navigate = useNavigate()
  const greeting = greetingForHour(new Date().getHours())
  const moneySeries = useMemo(() => {
    const posted = state.shopkeeperRecent.map((row) => row.amount)
    const opening = state.merchant.outstanding - posted.reduce((sum, amount) => sum + amount, 0)
    return cumulativeSeries(Math.max(0, opening), posted)
  }, [state.merchant.outstanding, state.shopkeeperRecent])

  return (
    <div>
      <p className="text-[13px] text-accent">{greeting}</p>
      <h1 className="mt-1 font-display text-5xl leading-[1.05] text-foreground">{state.merchant.name}</h1>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-card p-6">
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Total outstanding</p>
          <p className="mt-2 font-display text-4xl tabular-nums text-foreground md:text-5xl">
            {formatInr(state.merchant.outstanding)}
          </p>
        </div>
        <Stat icon={<Users className="size-4" />} label="Active customers" value={String(state.merchant.activeCustomers)} />
        <Stat icon={<Clock className="size-4" />} label="Pending confirmations" value={String(state.merchant.pendingConfirmations)} />
      </section>

      <section className="mt-4 rounded-[28px] bg-card p-6">
        <div className="mb-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Ledger trend</p>
            <h2 className="mt-1 font-display text-2xl text-foreground">Postings this cycle</h2>
          </div>
        </div>
        <MoneyGraph values={moneySeries} label="Outstanding over recent entries" className="text-primary" />
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => navigate('/shopkeeper/upload')}>
          <Camera /> Scan bill
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/shopkeeper/create')}>
          <Plus /> Enter items
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Recent transactions
        </h2>
        <div className="space-y-2">
          {state.shopkeeperRecent.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-[24px] bg-card px-4 py-3.5"
            >
              <div>
                <p className="text-foreground">{row.customerName}</p>
                <p className="font-mono text-sm text-muted-foreground">{formatInr(row.amount)}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-card p-6">
      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl text-foreground">{value}</p>
    </div>
  )
}

import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { useKhata } from '@/hooks/useKhata'
import { formatInr, greetingForHour } from '@/lib/utils'
import { Users, Clock, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export function ShopkeeperDashboardPage() {
  const { state } = useKhata()
  const navigate = useNavigate()
  const greeting = greetingForHour(new Date().getHours())

  return (
    <div>
      <p className="text-[13px] text-accent">{greeting}</p>
      <h1 className="mt-1 font-display text-5xl leading-[1.05] text-foreground">{state.merchant.name}</h1>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-card p-6 md:col-span-1">
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Total outstanding</p>
          <p className="mt-2 font-display text-5xl text-foreground">{formatInr(state.merchant.outstanding)}</p>
        </div>
        <Stat icon={<Users className="size-4" />} label="Active customers" value={String(state.merchant.activeCustomers)} />
        <Stat icon={<Clock className="size-4" />} label="Pending confirmations" value={String(state.merchant.pendingConfirmations)} />
      </section>

      <Button size="lg" className="mt-6" onClick={() => navigate('/shopkeeper/create')}>
        <Plus /> Create Transaction
      </Button>

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

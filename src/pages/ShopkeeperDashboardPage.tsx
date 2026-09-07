import { WalletCard } from '@/components/WalletCard'
import { Button } from '@/components/ui/button'
import { openBalancesByCustomer } from '@/lib/customerBalances'
import { formatPayBy, isOverdue } from '@/lib/payBy'
import { ledgerSpark } from '@/lib/moneyGraph'
import { useKhata } from '@/hooks/useKhata'
import { formatInr, greetingForHour } from '@/lib/utils'
import { Camera, Plus, QrCode } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export function ShopkeeperDashboardPage() {
  const { state } = useKhata()
  const navigate = useNavigate()
  const greeting = greetingForHour(new Date().getHours())
  const shopTxs = useMemo(
    () =>
      state.transactions.filter((tx) => tx.merchant === state.merchant.name && !tx.settled),
    [state.merchant.name, state.transactions],
  )
  const balances = useMemo(
    () => openBalancesByCustomer(state.transactions, state.merchant.name),
    [state.merchant.name, state.transactions],
  )
  const toCollect = balances.reduce((sum, row) => sum + row.amount, 0)
  const opening = Math.max(0, toCollect - shopTxs.reduce((sum, tx) => sum + tx.amount, 0))
  const chart = ledgerSpark(opening, shopTxs)
  const notices = state.notices.filter((notice) => notice.kind === 'settled' || notice.kind === 'auto').slice(0, 3)
  const dueCount = balances.filter((row) => row.payBy && isOverdue(row.payBy)).length
  const pending = shopTxs.filter((tx) => tx.status === 'pending').length

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_0.9fr]">
      <div className="grid gap-4">
        <WalletCard
          title="To collect"
          outstanding={toCollect}
          nextSettlement={state.wallet.nextSettlement}
          series={chart.values}
          labels={chart.labels}
          dueNote={`${balances.length} ${balances.length === 1 ? 'customer' : 'customers'} with open dues${dueCount > 0 ? ` · ${dueCount} overdue` : ''}. This is the live shop khata.`}
        />

        <section>
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

      <div className="grid gap-4">
        <p className="text-[13px] text-accent">{greeting}</p>
        <h1 className="font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">
          {state.merchant.name}
        </h1>

        <div className="grid grid-cols-2 gap-3">
          <SummaryTile label="Open bills" value={String(shopTxs.length)} tag="On khata" />
          <SummaryTile label="Pending" value={String(pending)} tag="Awaiting confirm" />
        </div>

        {notices.length > 0 ? (
          <section className="space-y-2" aria-live="polite">
            {notices.map((notice) => (
              <p key={notice.id} className="rounded-[20px] bg-primary/12 px-4 py-3 text-sm text-foreground">
                {notice.customerName} settled {formatInr(notice.amount)}
                <span className="text-muted-foreground"> · {notice.merchant}</span>
              </p>
            ))}
          </section>
        ) : (
          <p className="rounded-[20px] bg-card px-4 py-4 text-sm text-muted-foreground">
            Settlements land here as customers clear their khata.
          </p>
        )}

        <Button size="lg" className="h-14 w-full justify-start gap-3" onClick={() => navigate('/shopkeeper/create')}>
          <Plus className="size-5" /> New bill
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-14 w-full justify-start gap-3"
          onClick={() => navigate('/shopkeeper/upload')}
        >
          <Camera className="size-5" /> Scan a bill
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-14 w-full justify-start gap-3"
          onClick={() => navigate('/shopkeeper/qr')}
        >
          <QrCode className="size-5" /> Open live QR
        </Button>
      </div>
    </div>
  )
}

function SummaryTile({ label, value, tag }: { label: string; value: string; tag: string }) {
  return (
    <div className="rounded-[24px] bg-card px-4 py-4">
      <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums text-foreground">{value}</p>
      <p className="mt-2 text-xs text-accent">{tag}</p>
    </div>
  )
}

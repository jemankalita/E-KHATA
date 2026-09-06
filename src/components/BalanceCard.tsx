import { useReducedMotion } from 'motion/react'
import { shopOutstanding } from '../lib/khata'
import { formatDate } from '../lib/format'
import { useKhata } from '../store/KhataStore'
import { Card } from './ui/Card'
import { RockerMoney } from './RockerMoney'

export function BalanceCard() {
  const { customers, selectedCustomer } = useKhata()
  const reduce = useReducedMotion()
  const shopTotal = shopOutstanding(customers)

  return (
    <Card
      className="relative overflow-hidden p-5 sm:p-8"
      style={reduce ? undefined : { transform: 'perspective(1000px) rotateX(2deg)' }}
    >
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-teal-400/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-64 rounded-full bg-gold-400/10 blur-3xl" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">Total E-Khata</p>
      <RockerMoney amount={shopTotal} label="Total outstanding across all customers" className="mt-3 text-4xl sm:text-6xl" />
      <dl className="mt-6 grid gap-5 text-sm text-paper-200 sm:grid-cols-2">
        <div>
          <dt className="text-paper-400">Selected customer</dt>
          <dd className="mt-1 font-medium text-paper-50">{selectedCustomer.name}</dd>
          <dd className="tabular text-paper-400">{selectedCustomer.phone}</dd>
        </div>
        <div>
          <dt className="text-paper-400">Next settlement</dt>
          <dd className="mt-1 font-medium text-paper-50">{formatDate(selectedCustomer.nextSettlementDate)}</dd>
          <dt className="mt-3 text-paper-400">Customer khata</dt>
          <dd>
            <RockerMoney
              amount={selectedCustomer.currentBalance}
              label={`${selectedCustomer.name} outstanding`}
              className="text-2xl"
            />
          </dd>
        </div>
      </dl>
    </Card>
  )
}

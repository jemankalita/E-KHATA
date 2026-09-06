import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { QrCode, Scale, Upload } from 'lucide-react'
import { BalanceCard } from '../components/BalanceCard'
import { CustomerSelect } from '../components/CustomerSelect'
import { TransactionList } from '../components/TransactionList'
import { Card } from '../components/ui/Card'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { springs } from '../lib/motion-tokens'
import { staggerContainer, useStaggerItem } from '../lib/useSafeMotion'
import { useKhata } from '../store/KhataStore'

const actions = [
  { to: '/shop/upload', label: 'Upload Bill', icon: Upload, variant: 'primary' as const },
  { to: '/shop/quick-qr', label: 'Quick QR', icon: QrCode, variant: 'secondary' as const },
  { to: '/shop/settlement', label: 'Settle E-Khata', icon: Scale, variant: 'secondary' as const },
]

export function DashboardPage() {
  const { transactions } = useKhata()
  const item = useStaggerItem()

  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl space-y-5"
    >
      <motion.div variants={item} transition={springs.gentle} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Shop floor</p>
          <h2 className="font-display mt-1 text-balance text-3xl sm:text-4xl">Today's khata</h2>
        </div>
        <div className="w-full sm:max-w-xs">
          <CustomerSelect />
        </div>
      </motion.div>

      <motion.div variants={item} transition={springs.gentle}>
        <BalanceCard />
      </motion.div>

      <motion.div variants={item} transition={springs.gentle} className="grid gap-2 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.to} to={action.to} className="block">
              <PrimaryButton variant={action.variant} className="h-12 w-full">
                <Icon size={16} aria-hidden="true" /> {action.label}
              </PrimaryButton>
            </Link>
          )
        })}
      </motion.div>

      <motion.div variants={item} transition={springs.gentle}>
        <Card className="p-5 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-paper-400">Recent transactions</h3>
          <TransactionList transactions={transactions.slice(0, 6)} />
        </Card>
      </motion.div>
    </motion.div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { SvgBackdrop } from '../components/SvgBackdrop'
import { RockerMoney } from '../components/RockerMoney'
import { SuccessBurst } from '../components/SuccessBurst'
import { Card } from '../components/ui/Card'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { Skeleton } from '../components/ui/Skeleton'
import { formatRupee } from '../lib/format'
import { confirmIntent } from '../lib/persist'
import { parsePaySearch } from '../lib/payLink'
import { motionTokens, springs } from '../lib/motion-tokens'
import { playConfirmation } from '../lib/voice'
import type { Customer, Transaction } from '../types'

interface CommitResult {
  transaction: Transaction
  customer?: Customer
  previousBalance: number
}

function useIntentPreview(ref: string | null) {
  const [state, setState] = useState<{ name: string; loading: boolean; error: string | null }>({
    name: '',
    loading: Boolean(ref),
    error: null,
  })

  useEffect(() => {
    if (!ref) {
      setState({ name: '', loading: false, error: null })
      return
    }
    let active = true
    setState({ name: '', loading: true, error: null })
    fetch(`/api/intent/${encodeURIComponent(ref)}`)
      .then((response) => response.json() as Promise<{ customer?: Customer; error?: string }>)
      .then((data) => {
        if (!active) return
        setState({ name: data.customer?.name ?? '', loading: false, error: data.error ?? null })
      })
      .catch(() => {
        if (active) setState({ name: '', loading: false, error: null })
      })
    return () => {
      active = false
    }
  }, [ref])

  return state
}

export function PayPage() {
  const [params] = useSearchParams()
  const search = params.toString()
  // parsePaySearch allocates, so memoise on the raw query string to keep the
  // preview effect from re-firing on every render.
  const parsed = useMemo(() => parsePaySearch(new URLSearchParams(search)), [search])
  const preview = useIntentPreview(parsed?.ref ?? null)
  const reduce = useReducedMotion()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<CommitResult | null>(null)
  const [shownBalance, setShownBalance] = useState(0)

  useEffect(() => {
    if (!done) return
    setShownBalance(reduce ? done.customer?.currentBalance ?? done.transaction.amount : done.previousBalance)
    if (reduce) return
    const id = window.setTimeout(
      () => setShownBalance(done.customer?.currentBalance ?? done.transaction.amount),
      260,
    )
    return () => window.clearTimeout(id)
  }, [done, reduce])

  async function confirm() {
    if (!parsed) return
    setBusy(true)
    setError(null)
    try {
      const before = await fetch('/api/state')
        .then((response) => response.json() as Promise<{ customers?: Customer[] }>)
        .then((data) => data.customers?.find((entry) => entry.id === parsed.customerId)?.currentBalance ?? 0)
        .catch(() => 0)
      const result = await confirmIntent(parsed.ref)
      const customer = result.customers.find((entry) => entry.id === parsed.customerId)
      setDone({ transaction: result.transaction, customer, previousBalance: before })
      void playConfirmation(parsed.amount, false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this bill to your khata.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-8">
      <SvgBackdrop />
      <main className="w-full max-w-md">
        <Card className="p-5 text-center sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">Customer confirm</p>
          <h1 className="font-display mt-2 text-3xl">Add to E-Khata</h1>

          {!parsed ? (
            <p className="mt-4 text-pretty text-paper-400">
              This link is missing a customer ID or amount. Ask the shopkeeper to show the QR again.
            </p>
          ) : done ? (
            <div className="mt-6 space-y-4">
              <div className="relative mx-auto grid h-16 w-16 place-items-center">
                <SuccessBurst seed={done.transaction.amount} count={14} />
                <motion.span
                  initial={{ scale: reduce ? 1 : 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springs.bouncy}
                  className="relative grid h-16 w-16 place-items-center rounded-full bg-teal-400 text-white"
                >
                  <Check size={28} aria-hidden="true" />
                </motion.span>
              </div>
              <p className="text-paper-400">Added to your khata</p>
              <RockerMoney amount={shownBalance} label="Your outstanding khata" className="text-4xl sm:text-5xl" />
              <p className="text-pretty text-sm text-paper-400">
                {formatRupee(done.transaction.amount)} added for {done.customer?.name ?? 'you'} at{' '}
                {done.transaction.merchantName}.
              </p>
              <Link to="/customer" className="block">
                <PrimaryButton className="w-full">Open my khata</PrimaryButton>
              </Link>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : motionTokens.distance.sm }}
              animate={{ opacity: 1, y: 0 }}
              transition={springs.gentle}
            >
              <p className="mt-4 text-pretty text-paper-200">
                {formatRupee(parsed.amount)} will be added to{' '}
                {preview.loading ? 'your' : preview.name || 'your'} E-Khata at {parsed.merchant || 'the shop'}.
              </p>
              {preview.loading ? <Skeleton className="mx-auto mt-3 h-3 w-32" /> : null}
              <p className="mt-2 tabular text-sm text-paper-400">Ref {parsed.ref}</p>

              {preview.error ?? error ? (
                <p role="alert" className="mt-3 rounded-2xl bg-clay-400/10 px-3 py-2 text-sm text-clay-400">
                  {preview.error ?? error}
                </p>
              ) : null}

              <PrimaryButton
                className="mt-6 w-full"
                disabled={busy || Boolean(preview.error)}
                onClick={() => void confirm()}
              >
                {busy ? 'Adding…' : 'Confirm and add to E-Khata'}
              </PrimaryButton>
              <p className="mt-3 text-pretty text-xs text-paper-400">
                Confirming records this against your customer ID. The shopkeeper's screen updates instantly.
              </p>
            </motion.div>
          )}
        </Card>
      </main>
    </div>
  )
}

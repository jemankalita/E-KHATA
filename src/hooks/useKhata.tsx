import {
  buildDefaultPendingQr,
  INITIAL_STATE,
  RFID_FARE,
  STORAGE_KEY,
} from '@/data/demo'
import { applyPendingQr } from '@/lib/applyPendingQr'
import { publishLiveQr } from '@/lib/liveQr'
import { formatSequenceId } from '@/lib/utils'
import type {
  KhataState,
  PendingQr,
  Role,
  Transaction,
  TransactionItem,
} from '@/types'
import { playConfirmation } from '@/lib/voice'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

function loadState(): KhataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(INITIAL_STATE)
    const parsed = JSON.parse(raw) as KhataState
    if (!parsed.wallet || !Array.isArray(parsed.transactions)) {
      return structuredClone(INITIAL_STATE)
    }
    return parsed
  } catch {
    return structuredClone(INITIAL_STATE)
  }
}

function persist(state: KhataState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function verifiedForSource(source: Transaction['source'], confirmed: boolean) {
  return {
    qrPayload: source === 'QR',
    merchantIdentity: true,
    amount: true,
    transactionId: true,
    customerConfirmation: confirmed,
  }
}

interface KhataContextValue {
  role: Role | null
  setRole: (role: Role | null) => void
  state: KhataState
  resetDemo: () => void
  prepareScanPayload: () => PendingQr
  confirmPendingQr: (draft?: PendingQr) => Transaction | null
  addRfidFare: () => Transaction | null
  createMerchantQr: (input: {
    customerName: string
    items: TransactionItem[]
    category?: string
  }) => PendingQr
  markCustomerScanned: () => void
  confirmFromMerchant: () => Transaction | null
  applyScannedQr: (pending: PendingQr) => Transaction | null
  settleStore: (merchant: string) => void
  settleKhata: () => void
}

const KhataContext = createContext<KhataContextValue | null>(null)

export function KhataProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    const path = window.location.pathname
    if (path.startsWith('/customer')) return 'customer'
    if (path.startsWith('/shopkeeper')) return 'shopkeeper'
    return null
  })
  const [state, setState] = useState<KhataState>(() => loadState())

  const commit = useCallback((updater: (prev: KhataState) => KhataState) => {
    setState((prev) => {
      const next = updater(prev)
      persist(next)
      return next
    })
  }, [])

  const resetDemo = useCallback(() => {
    const fresh = structuredClone(INITIAL_STATE)
    persist(fresh)
    setState(fresh)
  }, [])

  const prepareScanPayload = useCallback((): PendingQr => {
    let payload: PendingQr = buildDefaultPendingQr()
    commit((prev) => {
      if (prev.pendingQr && prev.pendingQr.status !== 'confirmed') {
        payload = prev.pendingQr
        return prev
      }
      const taken = prev.transactions.some((tx) => tx.id === payload.id)
      if (taken) {
        payload = {
          ...payload,
          id: formatSequenceId(prev.nextSequence),
        }
        return {
          ...prev,
          pendingQr: payload,
          nextSequence: prev.nextSequence + 1,
        }
      }
      return { ...prev, pendingQr: payload }
    })
    return payload
  }, [commit])

  const ingestConfirmed = useCallback(
    (prev: KhataState, pending: PendingQr): { next: KhataState; tx: Transaction } => {
      const next = applyPendingQr(prev, pending)
      const tx = next.transactions.find((row) => row.id === pending.id)
      if (!tx) {
        return { next: prev, tx: next.transactions[0] }
      }
      return { next, tx }
    },
    [],
  )

  const confirmPendingQr = useCallback((draft?: PendingQr): Transaction | null => {
    let created: Transaction | null = null
    commit((prev) => {
      const pending = draft ?? prev.pendingQr ?? null
      if (!pending) return prev
      const { next, tx } = ingestConfirmed(prev, pending)
      created = tx
      void publishLiveQr({ ...pending, status: 'confirmed' })
      return next
    })
    return created
  }, [commit, ingestConfirmed])

  const addRfidFare = useCallback((): Transaction | null => {
    let created: Transaction | null = null
    commit((prev) => {
      const tx: Transaction = {
        id: formatSequenceId(prev.nextSequence),
        merchant: 'Bus Route 21G',
        customerName: prev.customer.name,
        category: 'RFID Transaction',
        amount: RFID_FARE,
        items: [{ name: 'Fare', quantity: 1, price: RFID_FARE }],
        source: 'RFID',
        status: 'verified',
        timestamp: new Date().toISOString(),
        verification: verifiedForSource('RFID', true),
        settled: false,
      }
      created = tx
      void playConfirmation(tx.amount, false)
      return {
        ...prev,
        nextSequence: prev.nextSequence + 1,
        wallet: {
          ...prev.wallet,
          outstanding: prev.wallet.outstanding + RFID_FARE,
        },
        transactions: [tx, ...prev.transactions],
      }
    })
    return created
  }, [commit])

  const createMerchantQr = useCallback(
    (input: { customerName: string; items: TransactionItem[]; category?: string }) => {
      const amount = input.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
      let payload: PendingQr = buildDefaultPendingQr()
      commit((prev) => {
        const id = chooseQrId(prev)
        const bumped = id !== 'EK-2026-000381'
        payload = {
          id,
          merchant: prev.merchant.name,
          customerName: input.customerName.trim() || prev.customer.name,
          items: input.items,
          amount,
          category: input.category ?? 'Groceries',
          status: 'waiting',
        }
        void publishLiveQr(payload)
        return {
          ...prev,
          pendingQr: payload,
          nextSequence: bumped ? prev.nextSequence + 1 : prev.nextSequence,
          merchant: {
            ...prev.merchant,
            pendingConfirmations: prev.merchant.pendingConfirmations + 1,
          },
        }
      })
      return payload
    },
    [commit],
  )

  const markCustomerScanned = useCallback(() => {
    commit((prev) => {
      if (!prev.pendingQr || prev.pendingQr.status === 'confirmed') return prev
      const next = { ...prev.pendingQr, status: 'scanned' as const }
      void publishLiveQr(next)
      return { ...prev, pendingQr: next }
    })
  }, [commit])

  const confirmFromMerchant = useCallback((): Transaction | null => {
    let created: Transaction | null = null
    commit((prev) => {
      if (!prev.pendingQr) return prev
      const { next, tx } = ingestConfirmed(prev, prev.pendingQr)
      created = tx
      void publishLiveQr({ ...prev.pendingQr, status: 'confirmed' })
      return next
    })
    return created
  }, [commit, ingestConfirmed])

  const applyScannedQr = useCallback(
    (pending: PendingQr): Transaction | null => {
      return confirmPendingQr(pending)
    },
    [confirmPendingQr],
  )

  const settleStore = useCallback((merchant: string) => {
    commit((prev) => {
      const openForStore = prev.transactions.filter((tx) => !tx.settled && tx.merchant === merchant)
      if (openForStore.length === 0) return prev
      const amount = openForStore.reduce((sum, tx) => sum + tx.amount, 0)
      const transactions = prev.transactions.map((tx) =>
        !tx.settled && tx.merchant === merchant ? { ...tx, settled: true } : tx,
      )
      const remainingOpen = transactions.some((tx) => !tx.settled)
      const isHomeMerchant = merchant === prev.merchant.name
      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          outstanding: Math.max(0, prev.wallet.outstanding - amount),
        },
        merchant: isHomeMerchant
          ? {
              ...prev.merchant,
              outstanding: Math.max(0, prev.merchant.outstanding - amount),
            }
          : prev.merchant,
        transactions,
        settlement: remainingOpen
          ? prev.settlement
          : {
              ...prev.settlement,
              status: 'cleared',
              clearedAt: new Date().toISOString(),
            },
      }
    })
  }, [commit])

  const settleKhata = useCallback(() => {
    commit((prev) => {
      const sharmaShare = prev.transactions
        .filter((tx) => !tx.settled && tx.merchant === prev.merchant.name)
        .reduce((sum, tx) => sum + tx.amount, 0)
      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          outstanding: 0,
          carriedForward: 0,
        },
        merchant: {
          ...prev.merchant,
          outstanding: Math.max(0, prev.merchant.outstanding - sharmaShare),
        },
        transactions: prev.transactions.map((tx) => ({ ...tx, settled: true })),
        settlement: {
          ...prev.settlement,
          status: 'cleared',
          clearedAt: new Date().toISOString(),
        },
      }
    })
  }, [commit])

  useEffect(() => {
    if (state.settlement.status === 'cleared') return
    if (new Date(state.settlement.isoDate).getTime() > Date.now()) return
    settleKhata()
  }, [settleKhata, state.settlement.isoDate, state.settlement.status])

  const value = useMemo(
    () => ({
      role,
      setRole,
      state,
      resetDemo,
      prepareScanPayload,
      confirmPendingQr,
      addRfidFare,
      createMerchantQr,
      markCustomerScanned,
      confirmFromMerchant,
      applyScannedQr,
      settleStore,
      settleKhata,
    }),
    [
      role,
      state,
      resetDemo,
      prepareScanPayload,
      confirmPendingQr,
      addRfidFare,
      createMerchantQr,
      markCustomerScanned,
      confirmFromMerchant,
      applyScannedQr,
      settleStore,
      settleKhata,
    ],
  )

  return <KhataContext.Provider value={value}>{children}</KhataContext.Provider>
}

function chooseQrId(prev: KhataState): string {
  const preferred = 'EK-2026-000381'
  if (prev.transactions.some((tx) => tx.id === preferred)) {
    return formatSequenceId(prev.nextSequence)
  }
  return preferred
}

export function useKhata() {
  const ctx = useContext(KhataContext)
  if (!ctx) throw new Error('useKhata must be used within KhataProvider')
  return ctx
}

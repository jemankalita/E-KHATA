import {
  buildDefaultPendingQr,
  INITIAL_STATE,
  RFID_FARE,
  STORAGE_KEY,
} from '@/data/demo'
import { applyPendingQr } from '@/lib/applyPendingQr'
import { publishLiveQr } from '@/lib/liveQr'
import { recognizeBill, type BillRecognition } from '@/lib/ocr'
import { payByFromPreset } from '@/lib/payBy'
import type { RfidTap } from '@/lib/rfid'
import { applyCustomerPayment, correctBillAmount, fileDispute } from '@/lib/ledgerOps'
import { markNoticesSeen as markNoticesSeenState, settleKhataAll, settleStoreBills } from '@/lib/settlement'
import { formatSequenceId } from '@/lib/utils'
import type {
  KhataState,
  PendingQr,
  Role,
  Transaction,
  TransactionItem,
} from '@/types'
import { playConfirmation } from '@/lib/voice'
import { useAuth } from '@/hooks/useAuth'
import { loadKhataState, saveKhataState, seedKhataState } from '@/lib/khataRemote'
import { getSupabase } from '@/lib/supabaseClient'
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
    return {
      ...parsed,
      notices: Array.isArray(parsed.notices) ? parsed.notices : [],
      ledgerEvents: Array.isArray(parsed.ledgerEvents) ? parsed.ledgerEvents : [],
      pendingQr: parsed.pendingQr
        ? { ...parsed.pendingQr, payBy: parsed.pendingQr.payBy || payByFromPreset('7d') }
        : null,
      transactions: parsed.transactions.map((tx) => ({
        ...tx,
        payBy: tx.payBy || parsed.settlement?.isoDate || payByFromPreset('7d'),
      })),
    }
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
  addRfidFare: (tap?: RfidTap) => Transaction | null
  createMerchantQr: (input: {
    customerName: string
    items: TransactionItem[]
    category?: string
    payBy?: string
  }) => PendingQr
  markCustomerScanned: () => void
  confirmFromMerchant: () => Transaction | null
  applyScannedQr: (pending: PendingQr) => Transaction | null
  settleStore: (merchant: string) => void
  payStore: (merchant: string, amount: number) => void
  disputeBill: (transactionId: string, note: string) => void
  correctBill: (transactionId: string, amount: number) => void
  settleKhata: () => void
  markNoticesSeen: (ids: string[]) => void
  ocrDraft: BillRecognition | null
  ocrBusy: boolean
  runOcr: (imageUrl: string) => Promise<BillRecognition>
  setOcrDraft: (draft: BillRecognition | null) => void
}

const KhataContext = createContext<KhataContextValue | null>(null)

export function KhataProvider({ children }: { children: ReactNode }) {
  const { profile, loading: authLoading } = useAuth()
  const [role, setRole] = useState<Role | null>(() => {
    const path = `${window.location.pathname}${window.location.hash}`
    if (path.startsWith('/customer')) return 'customer'
    if (path.startsWith('/shopkeeper')) return 'shopkeeper'
    return null
  })
  const [state, setState] = useState<KhataState>(() => loadState())
  const [ocrDraft, setOcrDraft] = useState<BillRecognition | null>(null)
  const [ocrBusy, setOcrBusy] = useState(false)

  useEffect(() => {
    if (profile) setRole(profile.role)
  }, [profile])

  const persistRemote = useCallback(
    (next: KhataState) => {
      const client = getSupabase()
      if (client && profile) void saveKhataState(client as never, profile.id, next)
    },
    [profile],
  )

  const commit = useCallback((updater: (prev: KhataState) => KhataState) => {
    setState((prev) => {
      const next = updater(prev)
      persist(next)
      persistRemote(next)
      return next
    })
  }, [persistRemote])

  const resetDemo = useCallback(() => {
    const fresh = profile ? seedKhataState(profile) : structuredClone(INITIAL_STATE)
    persist(fresh)
    persistRemote(fresh)
    setState(fresh)
  }, [persistRemote, profile])

  useEffect(() => {
    if (authLoading || !profile) return
    const client = getSupabase()
    if (!client) return
    let cancelled = false
    void loadKhataState(client as never, profile.id)
      .then((remote) => {
        if (cancelled) return
        if (remote) {
          persist(remote)
          setState(remote)
          return
        }
        const seeded = seedKhataState(profile)
        persist(seeded)
        setState(seeded)
        void saveKhataState(client as never, profile.id, seeded)
      })
      .catch(() => {
        // Keep the local snapshot if the remote read fails.
      })
    return () => {
      cancelled = true
    }
  }, [authLoading, profile])

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

  const addRfidFare = useCallback((tap?: RfidTap): Transaction | null => {
    let created: Transaction | null = null
    const amount = tap?.amount ?? RFID_FARE
    const merchant = tap?.merchant ?? 'Bus Route 21G'
    const category = tap?.category ?? 'RFID Transaction'
    commit((prev) => {
      const tx: Transaction = {
        id: formatSequenceId(prev.nextSequence),
        merchant,
        customerName: prev.customer.name,
        category,
        amount,
        items: [{ name: 'Fare', quantity: 1, price: amount }],
        source: 'RFID',
        status: 'verified',
        timestamp: new Date().toISOString(),
        verification: verifiedForSource('RFID', true),
        settled: false,
        payBy: payByFromPreset('today'),
        amountPaid: 0,
      }
      created = tx
      void playConfirmation(tx.amount, false)
      return {
        ...prev,
        nextSequence: prev.nextSequence + 1,
        wallet: {
          ...prev.wallet,
          outstanding: prev.wallet.outstanding + amount,
        },
        transactions: [tx, ...prev.transactions],
      }
    })
    return created
  }, [commit])

  const createMerchantQr = useCallback(
    (input: { customerName: string; items: TransactionItem[]; category?: string; payBy?: string }) => {
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
          payBy: input.payBy || payByFromPreset('7d'),
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
      const tx = confirmPendingQr(pending)
      if (tx) void playConfirmation(tx.amount, false)
      return tx
    },
    [confirmPendingQr],
  )

  const settleStore = useCallback((merchant: string) => {
    commit((prev) => settleStoreBills(prev, merchant, new Date(), prev.customer.name))
  }, [commit])

  const payStore = useCallback((merchant: string, amount: number) => {
    commit((prev) => applyCustomerPayment(prev, prev.customer.name, merchant, amount, new Date()))
  }, [commit])

  const disputeBill = useCallback((transactionId: string, note: string) => {
    commit((prev) => fileDispute(prev, transactionId, note, new Date()))
  }, [commit])

  const correctBill = useCallback((transactionId: string, amount: number) => {
    commit((prev) => correctBillAmount(prev, transactionId, amount, new Date()))
  }, [commit])

  const runOcr = useCallback(async (imageUrl: string) => {
    setOcrBusy(true)
    try {
      const recognition = await recognizeBill(imageUrl)
      setOcrDraft(recognition)
      return recognition
    } finally {
      setOcrBusy(false)
    }
  }, [])

  const settleKhata = useCallback(() => {
    commit((prev) => settleKhataAll(prev, new Date()))
  }, [commit])

  const markNoticesSeen = useCallback((ids: string[]) => {
    commit((prev) => markNoticesSeenState(prev, ids))
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
      payStore,
      disputeBill,
      correctBill,
      settleKhata,
      markNoticesSeen,
      ocrDraft,
      ocrBusy,
      runOcr,
      setOcrDraft,
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
      payStore,
      disputeBill,
      correctBill,
      settleKhata,
      markNoticesSeen,
      ocrDraft,
      ocrBusy,
      runOcr,
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

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { PRODUCT_CATALOG } from '../data/catalog'
import { CUSTOMERS, MERCHANT_NAME, TRANSACTIONS } from '../data/seed'
import { matchItems, overallConfidence } from '../lib/matching'
import { recognizeBill } from '../lib/ocr'
import { autoSettleDue } from '../lib/khata'
import { confirmIntent, confirmIntentLocal, createIntent, fetchSnapshot, settleLocal, settleRemote } from '../lib/persist'
import { playConfirmation } from '../lib/voice'
import type { BillDraft, Customer, Item, PaymentMode, QuickQRDraft, Transaction } from '../legacy/types'

interface ToastState {
  message: string
  tone: 'success' | 'error' | 'info'
}

/** Snapshot of the celebrated balance change, so the money reel can roll old → new. */
export interface CommitCelebration {
  transactionId: string
  customerId: string
  previousBalance: number
  balance: number
  seq: number
}

interface AppState {
  customers: Customer[]
  transactions: Transaction[]
  selectedCustomerId: string
  billDraft: BillDraft | null
  quickQr: QuickQRDraft | null
  lastTransaction: Transaction | null
  lastCommit: CommitCelebration | null
  voiceSource: string | null
  muted: boolean
  ocrBusy: boolean
  waitingRef: string | null
  toast: ToastState | null
}

type Action =
  | { type: 'hydrate'; customers: Customer[]; transactions: Transaction[] }
  | { type: 'select-customer'; customerId: string }
  | { type: 'set-bill'; draft: BillDraft | null }
  | { type: 'patch-bill'; patch: Partial<BillDraft> }
  | { type: 'set-items'; items: Item[] }
  | { type: 'set-quick-qr'; draft: QuickQRDraft | null }
  | { type: 'set-ocr-busy'; value: boolean }
  | { type: 'toggle-mute' }
  | { type: 'toast'; toast: ToastState | null }
  | { type: 'wait-ref'; referenceId: string | null }
  | { type: 'commit'; customers: Customer[]; transactions: Transaction[]; transaction: Transaction; voiceSource: string }

const initialState: AppState = {
  customers: CUSTOMERS,
  transactions: TRANSACTIONS,
  selectedCustomerId: CUSTOMERS[0]!.id,
  billDraft: null,
  quickQr: null,
  lastTransaction: null,
  lastCommit: null,
  voiceSource: null,
  muted: false,
  ocrBusy: false,
  waitingRef: null,
  toast: null,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate': {
      const settled = autoSettleDue(action.customers, action.transactions)
      return { ...state, customers: settled.customers, transactions: settled.transactions }
    }
    case 'select-customer':
      return { ...state, selectedCustomerId: action.customerId }
    case 'set-bill':
      return { ...state, billDraft: action.draft }
    case 'patch-bill':
      return state.billDraft ? { ...state, billDraft: { ...state.billDraft, ...action.patch } } : state
    case 'set-items': {
      if (!state.billDraft) return state
      const extractedItems = matchItems(action.items, PRODUCT_CATALOG)
      return {
        ...state,
        billDraft: {
          ...state.billDraft,
          extractedItems,
          totalAmount: extractedItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
          confidenceScore: overallConfidence(extractedItems),
          needsReview: extractedItems.some((item) => item.confidence < 0.8),
        },
      }
    }
    case 'set-quick-qr':
      return { ...state, quickQr: action.draft }
    case 'set-ocr-busy':
      return { ...state, ocrBusy: action.value }
    case 'toggle-mute':
      return { ...state, muted: !state.muted }
    case 'toast':
      return { ...state, toast: action.toast }
    case 'wait-ref':
      return { ...state, waitingRef: action.referenceId }
    case 'commit': {
      // The same commit arrives twice on the shopkeeper device: once from the
      // confirm response and once from the broadcast. Celebrate it only once.
      if (state.lastCommit?.transactionId === action.transaction.id) {
        return { ...state, customers: action.customers, transactions: action.transactions, waitingRef: null }
      }
      const { customerId } = action.transaction
      const previousBalance = state.customers.find((entry) => entry.id === customerId)?.currentBalance ?? 0
      const balance = action.customers.find((entry) => entry.id === customerId)?.currentBalance ?? previousBalance
      return {
        ...state,
        customers: action.customers,
        transactions: action.transactions,
        lastTransaction: action.transaction,
        lastCommit: {
          transactionId: action.transaction.id,
          customerId,
          previousBalance,
          balance,
          seq: (state.lastCommit?.seq ?? 0) + 1,
        },
        voiceSource: action.voiceSource,
        waitingRef: null,
        toast: { message: `₹${action.transaction.amount} added to E-Khata`, tone: 'success' },
      }
    }
    default:
      return state
  }
}

interface StoreValue extends AppState {
  selectedCustomer: Customer
  selectCustomer: (customerId: string) => void
  runOcr: (imageUrl: string) => Promise<void>
  updateBill: (patch: Partial<BillDraft>) => void
  updateItems: (items: Item[]) => void
  setQuickQr: (draft: QuickQRDraft | null) => void
  registerIntent: (input: {
    merchantName: string
    amount: number
    items: Item[]
    paymentMode: PaymentMode
    referenceId: string
    customerId?: string
  }) => Promise<void>
  confirmScan: (referenceId: string) => Promise<Transaction>
  settle: () => Promise<{ settledAmount: number }>
  toggleMute: () => void
  clearToast: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

async function apiReachable(): Promise<boolean> {
  try {
    const response = await fetch('/api/state', { cache: 'no-store' })
    return response.ok
  } catch {
    return false
  }
}

export function KhataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    void fetchSnapshot().then((snapshot) =>
      dispatch({ type: 'hydrate', customers: snapshot.customers, transactions: snapshot.transactions }),
    )
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return
    const source = new EventSource('/api/events')
    source.onmessage = (event) => {
      const data = JSON.parse(event.data) as {
        type?: string
        customers?: Customer[]
        transactions?: Transaction[]
        transaction?: Transaction
      }
      if (data.type === 'committed' && data.transaction && data.customers && data.transactions) {
        dispatch({
          type: 'commit',
          customers: data.customers,
          transactions: data.transactions,
          transaction: data.transaction,
          voiceSource: 'remote',
        })
        return
      }
      if (data.customers && data.transactions) {
        dispatch({ type: 'hydrate', customers: data.customers, transactions: data.transactions })
      }
    }
    return () => source.close()
  }, [])

  const selectedCustomer = useMemo(() => {
    return state.customers.find((customer) => customer.id === state.selectedCustomerId) ?? state.customers[0]!
  }, [state.customers, state.selectedCustomerId])

  const value = useMemo<StoreValue>(() => {
    return {
      ...state,
      selectedCustomer,
      selectCustomer: (customerId: string) => dispatch({ type: 'select-customer', customerId }),
      runOcr: async (imageUrl: string) => {
        dispatch({ type: 'set-ocr-busy', value: true })
        try {
          dispatch({ type: 'set-bill', draft: (await recognizeBill(imageUrl)).draft })
        } catch (error) {
          dispatch({
            type: 'toast',
            toast: { message: error instanceof Error ? error.message : 'OCR failed', tone: 'error' },
          })
        } finally {
          dispatch({ type: 'set-ocr-busy', value: false })
        }
      },
      updateBill: (patch) => dispatch({ type: 'patch-bill', patch }),
      updateItems: (items) => dispatch({ type: 'set-items', items }),
      setQuickQr: (draft) => dispatch({ type: 'set-quick-qr', draft }),
      registerIntent: async (input) => {
        const customerId = input.customerId ?? selectedCustomer.id
        try {
          await createIntent({ ...input, customerId })
        } catch (error) {
          if (await apiReachable()) {
            dispatch({
              type: 'toast',
              toast: {
                message: error instanceof Error ? error.message : 'Could not create this QR.',
                tone: 'error',
              },
            })
          }
        }
        dispatch({ type: 'wait-ref', referenceId: input.referenceId })
      },
      confirmScan: async (referenceId) => {
        try {
          const result = await confirmIntent(referenceId)
          const voiceSource = await playConfirmation(result.transaction.amount, state.muted)
          dispatch({
            type: 'commit',
            customers: result.customers,
            transactions: result.transactions,
            transaction: { ...result.transaction, voicePlayed: voiceSource !== 'muted' },
            voiceSource,
          })
          return result.transaction
        } catch (error) {
          // Only fall back to the offline ledger when the API is genuinely
          // unreachable; a reachable API rejecting means a real business error.
          if (await apiReachable()) {
            const message = error instanceof Error ? error.message : 'Could not add this bill to the khata.'
            dispatch({ type: 'toast', toast: { message, tone: 'error' } })
            throw error instanceof Error ? error : new Error(message)
          }
          const result = await confirmIntentLocal(
            { customers: state.customers, transactions: state.transactions },
            {
              customer: selectedCustomer,
              merchantName: MERCHANT_NAME,
              amount: state.quickQr?.amount ?? state.billDraft?.totalAmount ?? 0,
              items: state.billDraft?.extractedItems ?? [],
              paymentMode: state.quickQr ? 'quick-qr' : 'ocr-qr',
              referenceId,
            },
          )
          const voiceSource = await playConfirmation(result.transaction.amount, state.muted)
          dispatch({
            type: 'commit',
            customers: result.customers,
            transactions: result.transactions,
            transaction: { ...result.transaction, voicePlayed: voiceSource !== 'muted' },
            voiceSource,
          })
          return result.transaction
        }
      },
      settle: async () => {
        try {
          const result = await settleRemote(selectedCustomer.id)
          dispatch({ type: 'hydrate', customers: result.customers, transactions: result.transactions })
          dispatch({ type: 'toast', toast: { message: `Settled ₹${result.settledAmount}`, tone: 'success' } })
          return { settledAmount: result.settledAmount }
        } catch {
          const result = settleLocal(
            { customers: state.customers, transactions: state.transactions },
            selectedCustomer.id,
          )
          dispatch({ type: 'hydrate', customers: result.customers, transactions: result.transactions })
          dispatch({ type: 'toast', toast: { message: `Settled ₹${result.settledAmount}`, tone: 'success' } })
          return { settledAmount: result.settledAmount }
        }
      },
      toggleMute: () => dispatch({ type: 'toggle-mute' }),
      clearToast: () => dispatch({ type: 'toast', toast: null }),
    }
  }, [selectedCustomer, state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useKhata() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useKhata must be used inside KhataProvider')
  return value
}

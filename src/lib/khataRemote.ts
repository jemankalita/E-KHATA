import { payByFromPreset } from '@/lib/payBy'
import type { KhataState, Role } from '@/types'

export interface KhataRemoteClient {
  from(table: 'khata_states'): {
    select(columns: string): {
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: { state: unknown } | null; error: { message: string } | null }>
      }
    }
    upsert(
      row: { user_id: string; state: KhataState; updated_at: string },
      options: { onConflict: 'user_id' },
    ): PromiseLike<{ error: { message: string } | null }>
  }
}

export function isKhataState(value: unknown): value is KhataState {
  if (typeof value !== 'object' || value === null) return false
  const snapshot = value as Partial<KhataState>
  return (
    typeof snapshot.customer?.name === 'string' &&
    typeof snapshot.merchant?.name === 'string' &&
    typeof snapshot.wallet?.outstanding === 'number' &&
    Array.isArray(snapshot.transactions) &&
    typeof snapshot.nextSequence === 'number'
  )
}

function openingSettlement(now: Date) {
  const due = new Date(payByFromPreset('30d', now))
  return {
    isoDate: due.toISOString().slice(0, 10),
    dateLabel: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(due),
  }
}

export function emptyKhataState(profile: { role: Role; displayName: string }, now = new Date()): KhataState {
  const name = profile.displayName.trim()
  const settlement = openingSettlement(now)
  return {
    customer: { name: profile.role === 'customer' && name ? name : 'New customer' },
    merchant: {
      name: profile.role === 'shopkeeper' && name ? name : 'New shop',
      outstanding: 0,
      activeCustomers: 0,
      pendingConfirmations: 0,
    },
    wallet: {
      outstanding: 0,
      nextSettlement: settlement.dateLabel,
      carriedForward: 0,
    },
    settlement: {
      dateLabel: settlement.dateLabel,
      isoDate: settlement.isoDate,
      status: 'open',
    },
    transactions: [],
    pendingQr: null,
    notices: [],
    shopkeeperRecent: [],
    nextSequence: 1,
  }
}

export function seedKhataState(profile: { role: Role; displayName: string }, now = new Date()): KhataState {
  return emptyKhataState(profile, now)
}

export async function loadKhataState(client: KhataRemoteClient, userId: string) {
  const result = await client.from('khata_states').select('state').eq('user_id', userId).maybeSingle()
  if (result.error) throw new Error(result.error.message)
  if (!result.data) return null
  if (!isKhataState(result.data.state)) {
    throw new Error('Saved khata data looks incomplete. Reset the demo or sign in again.')
  }
  return result.data.state
}

export async function saveKhataState(client: KhataRemoteClient, userId: string, state: KhataState) {
  const result = await client.from('khata_states').upsert(
    {
      user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (result.error) throw new Error(result.error.message)
}

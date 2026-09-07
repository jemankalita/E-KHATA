import { INITIAL_STATE } from '@/data/demo'
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

export function seedKhataState(profile: { role: Role; displayName: string }): KhataState {
  const seeded = structuredClone(INITIAL_STATE)
  if (!profile.displayName.trim()) return seeded
  if (profile.role === 'customer') {
    return { ...seeded, customer: { name: profile.displayName } }
  }
  return { ...seeded, merchant: { ...seeded.merchant, name: profile.displayName } }
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

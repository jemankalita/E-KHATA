import { describe, expect, it, vi } from 'vitest'
import { INITIAL_STATE } from '@/data/demo'
import { isKhataState, loadKhataState, saveKhataState, seedKhataState } from './khataRemote'

describe('isKhataState', () => {
  it('accepts the live khata snapshot and rejects junk', () => {
    expect(isKhataState(INITIAL_STATE)).toBe(true)
    expect(isKhataState(null)).toBe(false)
    expect(isKhataState({ wallet: {}, transactions: [] })).toBe(false)
  })
})

describe('khata remote store', () => {
  it('returns null when the user has no saved khata yet', async () => {
    const client = {
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      })),
    }

    await expect(loadKhataState(client as never, 'user-1')).resolves.toBeNull()
  })

  it('hydrates a stored snapshot for the signed-in user', async () => {
    const client = {
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { state: INITIAL_STATE }, error: null }),
          }),
        }),
      })),
    }

    await expect(loadKhataState(client as never, 'user-1')).resolves.toEqual(INITIAL_STATE)
  })

  it('upserts the snapshot under the signed-in user', async () => {
    const upsert = vi.fn(async () => ({ error: null }))
    const client = {
      from: vi.fn(() => ({ upsert })),
    }

    await saveKhataState(client as never, 'user-9', INITIAL_STATE)
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-9',
        state: INITIAL_STATE,
      }),
      { onConflict: 'user_id' },
    )
  })

  it('names a new customer khata after the Google profile', () => {
    const seeded = seedKhataState({
      role: 'customer',
      displayName: 'Priya Singh',
    })
    expect(seeded.customer.name).toBe('Priya Singh')
    expect(seeded.transactions).toEqual(INITIAL_STATE.transactions)
  })
})

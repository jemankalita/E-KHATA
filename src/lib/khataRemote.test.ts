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

  it('starts a new customer khata at zero with no borrowed demo bills', () => {
    const seeded = seedKhataState({
      role: 'customer',
      displayName: 'Priya Singh',
    })
    expect(seeded.customer.name).toBe('Priya Singh')
    expect(seeded.wallet.outstanding).toBe(0)
    expect(seeded.wallet.carriedForward).toBe(0)
    expect(seeded.merchant.outstanding).toBe(0)
    expect(seeded.merchant.activeCustomers).toBe(0)
    expect(seeded.transactions).toEqual([])
    expect(seeded.shopkeeperRecent).toEqual([])
    expect(seeded.pendingQr).toBeNull()
  })

  it('starts a new shopkeeper khata at zero under the shop name', () => {
    const seeded = seedKhataState({
      role: 'shopkeeper',
      displayName: 'Gupta Kirana',
    })
    expect(seeded.merchant.name).toBe('Gupta Kirana')
    expect(seeded.merchant.outstanding).toBe(0)
    expect(seeded.merchant.pendingConfirmations).toBe(0)
    expect(seeded.wallet.outstanding).toBe(0)
    expect(seeded.transactions).toEqual([])
    expect(seeded.shopkeeperRecent).toEqual([])
  })

  it('does not reuse the pitch demo settlement date after that month has passed', () => {
    const now = new Date('2026-10-15T08:00:00.000Z')
    const seeded = seedKhataState(
      {
        role: 'customer',
        displayName: 'Priya Singh',
      },
      now,
    )
    expect(seeded.settlement.isoDate).not.toBe('2026-09-30')
    expect(new Date(`${seeded.settlement.isoDate}T23:59:59.000Z`).getTime()).toBeGreaterThan(now.getTime())
    expect(seeded.wallet.nextSettlement).toBe(seeded.settlement.dateLabel)
  })
})

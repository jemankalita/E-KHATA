import { describe, expect, it } from 'vitest'
import { INITIAL_STATE } from '@/data/demo'
import { creditScoreFromQuery } from './http'

describe('creditScoreFromQuery', () => {
  it('scores the demo Sharma Stores khata for Rahul Sharma', () => {
    const result = creditScoreFromQuery(
      new URL('http://localhost/api/credit-score?customer=Rahul%20Sharma&merchant=Sharma%20Stores'),
      INITIAL_STATE,
    )
    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({
      product: 'alternative_data',
      status: 'scored',
      lending: { inScope: false },
    })
  })

  it('rejects a missing customer', () => {
    const result = creditScoreFromQuery(new URL('http://localhost/api/credit-score'))
    expect(result.status).toBe(400)
  })
})

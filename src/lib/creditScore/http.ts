import { INITIAL_STATE } from '../../data/demo'
import type { CreditScoreReport } from './types'
import type { KhataState } from '../../types'
import { creditReportFor } from './fromKhataState'

export function creditScoreFromQuery(
  url: URL,
  state: Pick<KhataState, 'transactions' | 'ledgerEvents'> = INITIAL_STATE,
): { status: number; body: CreditScoreReport | { error: string } } {
  const customer = url.searchParams.get('customer')?.trim()
  const merchant = url.searchParams.get('merchant')?.trim() || INITIAL_STATE.merchant.name
  if (!customer) {
    return { status: 400, body: { error: 'Query customer and optional merchant are required.' } }
  }
  return { status: 200, body: creditReportFor(state, customer, merchant) }
}

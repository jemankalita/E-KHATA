import {
  LENDING_PHASE1_BOUNDARY,
  MIN_CONFIRMED_SETTLEMENTS,
  SCORE_MAX,
  SCORE_MIN,
  SCORE_VERSION,
} from './constants'
import type { CreditScoreReport, LedgerEvent, ScoreBand, ScoreFeature, ScoreInput } from './types'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function mean(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function stddev(values: number[]) {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function daysBetween(from: string, to: string) {
  return (Date.parse(to) - Date.parse(from)) / 86_400_000
}

function inScopeEvents(events: LedgerEvent[], customerName: string, merchant: string) {
  return events.filter((event) => event.customerName === customerName && event.merchant === merchant)
}

function confirmedPayments(events: LedgerEvent[]) {
  return events.filter((event) => event.kind === 'payment' && event.source === 'customer')
}

function feature(
  key: string,
  label: string,
  value: number,
  unit: string,
  contribution: number,
  explanation: string,
): ScoreFeature {
  const direction = contribution > 2 ? 'helps' : contribution < -2 ? 'hurts' : 'neutral'
  return { key, label, value, unit, contribution, direction, explanation }
}

function bandFor(score: number): ScoreBand {
  if (score >= 750) return 'strong'
  if (score >= 650) return 'reliable'
  return 'building'
}

export function scoreKhataCredit(input: ScoreInput): CreditScoreReport {
  const now = (input.now ?? new Date()).toISOString()
  const bills = input.bills.filter(
    (bill) => bill.customerName === input.customerName && bill.merchant === input.merchant,
  )
  const events = inScopeEvents(input.events, input.customerName, input.merchant)
  const payments = confirmedPayments(events)
  const confirmedSettlements = payments.length
  const disputes = events.filter((event) => event.kind === 'dispute')
  const corrections = events.filter((event) => event.kind === 'correction')
  const customerSettled = bills.filter((bill) => bill.settled && bill.settlementSource === 'customer')
  const settleDays = customerSettled
    .filter((bill) => bill.settledAt)
    .map((bill) => daysBetween(bill.postedAt, bill.settledAt!))
    .filter((days) => Number.isFinite(days) && days >= 0)
  const onTime = customerSettled.filter((bill) => {
    if (!bill.settledAt || !bill.payBy) return false
    return Date.parse(bill.settledAt) <= Date.parse(bill.payBy)
  }).length
  const fullPayments = payments.filter((event) => event.paymentKind === 'full').length
  const amounts = bills.map((bill) => bill.amount)
  const windowStart = Date.parse(now) - 90 * 86_400_000
  const recentBills = bills.filter((bill) => Date.parse(bill.postedAt) >= windowStart)
  const avgDays = settleDays.length > 0 ? mean(settleDays) : 0
  const onTimeRate = customerSettled.length > 0 ? onTime / customerSettled.length : 0
  const fullRepayRate = payments.length > 0 ? fullPayments / payments.length : 0
  const disputeRate = bills.length > 0 ? disputes.length / bills.length : 0
  const correctionRate = bills.length > 0 ? corrections.length / bills.length : 0
  const billsPer30 = recentBills.length / 3
  const stability = amounts.length > 0 ? 1 - clamp(stddev(amounts) / Math.max(mean(amounts), 1), 0, 1) : 0

  const features: ScoreFeature[] = [
    feature(
      'confirmed_settlements',
      'Confirmed settlements',
      confirmedSettlements,
      'count',
      clamp((confirmedSettlements / 12) * 80, 0, 80) - 20,
      `${confirmedSettlements} customer payment${confirmedSettlements === 1 ? '' : 's'} at this shop. Auto-settles are excluded.`,
    ),
    feature(
      'days_to_settle',
      'Days to settle',
      Math.round(avgDays * 10) / 10,
      'days',
      settleDays.length === 0 ? 0 : (1 - clamp(avgDays / 30, 0, 1)) * 90 - 20,
      settleDays.length === 0
        ? 'No customer-settled bills yet, so speed-to-pay is unused.'
        : `Mean ${Math.round(avgDays)} days from bill to customer settlement (auto-close ignored).`,
    ),
    feature(
      'on_time_rate',
      'On-time rate',
      Math.round(onTimeRate * 1000) / 1000,
      'share',
      customerSettled.length === 0 ? 0 : onTimeRate * 100 - 30,
      customerSettled.length === 0
        ? 'No customer-settled bills to compare against pay-by dates.'
        : `${onTime} of ${customerSettled.length} customer-settled bills were paid on or before pay-by.`,
    ),
    feature(
      'full_repay_rate',
      'Full vs partial repayment',
      Math.round(fullRepayRate * 1000) / 1000,
      'share',
      payments.length === 0 ? 0 : fullRepayRate * 80 - 20,
      payments.length === 0
        ? 'No customer payments recorded.'
        : `${fullPayments} of ${payments.length} customer payments closed the due in one go.`,
    ),
    feature(
      'dispute_rate',
      'Dispute rate',
      Math.round(disputeRate * 1000) / 1000,
      'share',
      bills.length === 0 ? 0 : (1 - clamp(disputeRate, 0, 1)) * 40 - 20,
      `${disputes.length} dispute${disputes.length === 1 ? '' : 's'} on ${bills.length} bill${bills.length === 1 ? '' : 's'} at this shop.`,
    ),
    feature(
      'correction_rate',
      'Correction rate',
      Math.round(correctionRate * 1000) / 1000,
      'share',
      bills.length === 0 ? 0 : (1 - clamp(correctionRate, 0, 1)) * 30 - 15,
      `${corrections.length} amount correction${corrections.length === 1 ? '' : 's'} on this shop khata.`,
    ),
    feature(
      'bill_frequency',
      'Bill frequency (90d)',
      Math.round(billsPer30 * 10) / 10,
      'bills / 30d',
      clamp(billsPer30 / 8, 0, 1) * 40 - 10,
      `${recentBills.length} bills in the last 90 days at this shop.`,
    ),
    feature(
      'amount_stability',
      'Amount stability',
      Math.round(stability * 1000) / 1000,
      'index',
      stability * 30 - 10,
      'How tightly bill amounts cluster. Spiky baskets score a little lower than steady kirana tickets.',
    ),
  ]

  const contributionSum = features.reduce((sum, row) => sum + row.contribution, 0)
  const score = Math.round(clamp(600 + contributionSum, SCORE_MIN, SCORE_MAX))
  const ready = confirmedSettlements >= MIN_CONFIRMED_SETTLEMENTS

  return {
    version: SCORE_VERSION,
    product: 'alternative_data',
    lending: { inScope: false, note: LENDING_PHASE1_BOUNDARY },
    subject: { customerName: input.customerName, merchant: input.merchant },
    status: ready ? 'scored' : 'unscored',
    unscoredReason: ready ? undefined : 'insufficient_history',
    confirmedSettlements,
    minConfirmedSettlements: MIN_CONFIRMED_SETTLEMENTS,
    score: ready ? score : null,
    band: ready ? bandFor(score) : null,
    features,
    computedAt: now,
  }
}

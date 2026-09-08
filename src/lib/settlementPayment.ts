export interface SettlementPaymentRequest {
  merchant: string
  customerName: string
  amountInr: number
  amountPaise: number
  currency: 'INR'
  description: string
  notes: {
    merchant: string
    purpose: 'khata-settlement'
  }
}

export function buildSettlementPayment(input: {
  merchant: string
  customerName: string
  amountInr: number
}): SettlementPaymentRequest {
  if (!Number.isFinite(input.amountInr) || input.amountInr <= 0) {
    throw new Error('Settlement amount must be a positive number.')
  }

  return {
    merchant: input.merchant,
    customerName: input.customerName,
    amountInr: input.amountInr,
    amountPaise: Math.round(input.amountInr * 100),
    currency: 'INR',
    description: `Settle ${input.merchant} on E-Khata`,
    notes: {
      merchant: input.merchant,
      purpose: 'khata-settlement',
    },
  }
}

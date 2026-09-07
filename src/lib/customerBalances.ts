export interface CustomerBalance {
  customerName: string
  amount: number
  payBy: string
  entries: number
}

export function openBalancesByCustomer(
  transactions: Array<{
    customerName: string
    merchant: string
    amount: number
    settled: boolean
    payBy?: string
  }>,
  merchantName: string,
): CustomerBalance[] {
  const map = new Map<string, CustomerBalance>()
  for (const tx of transactions) {
    if (tx.settled || tx.merchant !== merchantName) continue
    const current = map.get(tx.customerName) ?? {
      customerName: tx.customerName,
      amount: 0,
      payBy: tx.payBy ?? '',
      entries: 0,
    }
    const payBy =
      tx.payBy && (!current.payBy || Date.parse(tx.payBy) < Date.parse(current.payBy))
        ? tx.payBy
        : current.payBy
    map.set(tx.customerName, {
      customerName: tx.customerName,
      amount: current.amount + tx.amount,
      payBy,
      entries: current.entries + 1,
    })
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount)
}

export function soonestPayBy(
  rows: Array<{ payBy?: string; settled: boolean }>,
): string | null {
  const open = rows
    .filter((row) => !row.settled && row.payBy)
    .map((row) => row.payBy as string)
    .sort((a, b) => Date.parse(a) - Date.parse(b))
  return open[0] ?? null
}

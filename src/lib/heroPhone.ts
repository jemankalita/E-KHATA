export const HERO_PHONE_LEDGER = {
  initials: 'EK',
  outstanding: 12480,
  growthLabel: '+2.4%',
  nextSettlement: '12 Sep',
  series: [8200, 8450, 9100, 8880, 10240, 11110, 11820, 12480],
  openBills: [
    { merchant: 'Sharma Stores', amount: 420 },
    { merchant: 'Campus Canteen', amount: 185 },
    { merchant: 'Green Mart', amount: 760 },
  ],
} as const

export function heroPhoneAriaLabel() {
  return 'e-Khata on a phone: outstanding balance, khata graph, and open shop bills'
}
